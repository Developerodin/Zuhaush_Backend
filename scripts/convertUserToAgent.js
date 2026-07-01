import dotenv from 'dotenv';

dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

/**
 * Shared fields used by both users and agents — left untouched on conversion.
 * They automatically become the agent profile (name, phone, city, etc.).
 */
const SHARED_PROFILE_FIELDS = [
  'name',
  'email',
  'contactNumber',
  'cityofInterest',
  'preferences',
  'shortlistProperties',
  'registrationStatus',
  'isEmailVerified',
  'isOtpVerified',
  'isPhoneVerified',
  'accountType',
  'permissions',
  'image',
  'imageKey',
  'lastLoginAt',
  'isActive',
];

/**
 * Agent-only fields — not copied from user data; agencyName must be added in the app.
 */
const AGENT_ONLY_FIELD_KEYS = [
  'agencyName',
  'reraNumber',
  'state',
  'reraCertificate',
  'reraCertificateKey',
  'yearsOfExperience',
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    email: null,
    userId: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--email' && args[i + 1]) {
      options.email = args[i + 1].trim().toLowerCase();
      i += 1;
      continue;
    }

    if (arg === '--id' && args[i + 1]) {
      options.userId = args[i + 1].trim();
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
};

const printUsage = () => {
  console.log(`
Convert an existing user account to agent without changing email or password.

Usage:
  node scripts/convertUserToAgent.js --email user@example.com
  node scripts/convertUserToAgent.js --id 64f1c2a3b4d5e6f7a8b9c0d1
  node scripts/convertUserToAgent.js --email user@example.com --dry-run

Options:
  --email <email>   Email of the user to convert
  --id <mongoId>    MongoDB _id of the user to convert
  --dry-run         Show what would change without writing to the database
  --help, -h        Show this help text

Notes:
  - Email and password are never modified.
  - The same MongoDB _id is kept, so shortlist, visits, messages, and tokens stay linked.
  - Shared profile data (name, phone, city, preferences, shortlist) carries over as the agent profile.
  - Only role is changed in the database; agencyName and other agent-only fields stay blank for later.
  - The user must log in through the Agent flow in the mobile app after conversion.
`);
};

const pickFields = (user, keys) =>
  keys.reduce((acc, key) => {
    acc[key] = user[key] ?? null;
    return acc;
  }, {});

const buildConversionPlan = (user) => {
  const inheritedProfile = pickFields(user, [
    'name',
    'email',
    'contactNumber',
    'cityofInterest',
    'registrationStatus',
    'isEmailVerified',
    'isOtpVerified',
  ]);

  const agentOnlyFields = pickFields(user, AGENT_ONLY_FIELD_KEYS);

  const needsManualInput = {
    requiredForPublicListing: !agentOnlyFields.agencyName ? ['agencyName'] : [],
    optional: AGENT_ONLY_FIELD_KEYS.filter(
      (key) =>
        key !== 'agencyName' &&
        (agentOnlyFields[key] === null || agentOnlyFields[key] === '' || agentOnlyFields[key] === undefined)
    ),
  };

  return {
    dbUpdate: { role: 'agent' },
    inheritedProfile,
    agentOnlyFields,
    needsManualInput,
    preserved: {
      ...pickFields(user, SHARED_PROFILE_FIELDS),
      password: '[unchanged bcrypt hash]',
      shortlistCount: user.shortlistProperties?.length || 0,
    },
  };
};

const summarizeUser = (user) => {
  const plan = buildConversionPlan(user);

  return {
    id: user._id.toString(),
    role: user.role,
    inheritedAgentProfile: plan.inheritedProfile,
    agentOnlyFields: plan.agentOnlyFields,
    shortlistCount: user.shortlistProperties?.length || 0,
  };
};

const convertUserToAgent = async () => {
  const options = parseArgs();

  if (options.help || (!options.email && !options.userId)) {
    printUsage();
    process.exit(options.help ? 0 : 1);
  }

  const mongoose = (await import('mongoose')).default;
  const config = (await import('../src/config/config.js')).default;
  const User = (await import('../src/models/user.model.js')).default;

  let connected = false;

  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    connected = true;
    console.log('Connected to MongoDB\n');

    const query = options.userId
      ? { _id: options.userId }
      : { email: options.email };

    const user = await User.findOne(query);

    if (!user) {
      throw new Error('User not found. Check the email or id and try again.');
    }

    if (user.role === 'agent') {
      console.log('Nothing to do: this account is already an agent.');
      console.log(JSON.stringify(summarizeUser(user), null, 2));
      return;
    }

    if (user.role !== 'user') {
      throw new Error(`Unsupported role "${user.role}". Only regular users can be converted.`);
    }

    const plan = buildConversionPlan(user);

    console.log('Current account:');
    console.log(JSON.stringify(summarizeUser(user), null, 2));
    console.log('\nOnly database change:');
    console.log(JSON.stringify(plan.dbUpdate, null, 2));
    console.log('\nAgent profile after conversion (inherited from user — no copy needed):');
    console.log(JSON.stringify(plan.inheritedProfile, null, 2));
    console.log('\nAgent-only fields (unchanged, fill later in Edit Agent Profile):');
    console.log(JSON.stringify(plan.agentOnlyFields, null, 2));
    console.log('\nFill in app:');
    console.log(`  Required for public listing: ${plan.needsManualInput.requiredForPublicListing.join(', ') || 'none (already set)'}`);
    console.log(`  Optional later: ${plan.needsManualInput.optional.join(', ') || 'none'}`);
    console.log('\nOther preserved fields:');
    console.log(JSON.stringify(plan.preserved, null, 2));

    if (options.dryRun) {
      console.log('\nDry run only. No database changes were made.');
      return;
    }

    // Use updateOne so Mongoose pre-save password hashing never runs.
    const result = await User.updateOne({ _id: user._id }, { $set: plan.dbUpdate });

    // Mongoose 5 / MongoDB driver 3.x uses n/nModified; newer drivers use matchedCount/modifiedCount.
    const matchedCount = result.matchedCount ?? result.n ?? 0;
    const modifiedCount = result.modifiedCount ?? result.nModified ?? 0;

    if (matchedCount === 0) {
      throw new Error('User document not found during update.');
    }

    const updatedUser = await User.findById(user._id);

    if (modifiedCount === 0 && updatedUser?.role !== 'agent') {
      throw new Error('Update did not modify the user document.');
    }

    if (modifiedCount === 0 && updatedUser?.role === 'agent') {
      console.log('\nRole was already agent in the database. No changes were needed.');
    }

    console.log('\nConversion complete.');
    console.log(JSON.stringify(summarizeUser(updatedUser), null, 2));
    console.log('\nNext steps:');
    console.log('- Ask the user to log out and log back in through the Agent login flow.');
    console.log('- They can keep the same email and password.');
    console.log(`- Profile already has: name, phone, city (${plan.inheritedProfile.cityofInterest || 'n/a'}).`);
    console.log('- Add agencyName in Edit Agent Profile to appear in public agent listings.');
    console.log('- Optionally add reraNumber, yearsOfExperience, and RERA certificate later.');
  } catch (error) {
    console.error('Error converting user to agent:', error.message);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
};

convertUserToAgent();
