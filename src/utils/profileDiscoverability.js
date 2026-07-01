const hasTruthyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isTruthyQueryFlag = (value) => value === true || value === 'true';

/**
 * Whether list endpoints should skip discoverable-profile filtering.
 * Admin and internal tools pass includeIncomplete=true to list every record.
 */
const shouldIncludeIncompleteProfiles = (filter = {}) =>
  isTruthyQueryFlag(filter.includeIncomplete) || Boolean(filter.registrationStatus);

const hasDisplayableBuilderProfileFields = () => ({
  $or: [
    { company: { $exists: true, $nin: [null, ''] } },
    { city: { $exists: true, $nin: [null, ''] } },
    { contactInfo: { $exists: true, $nin: [null, ''] } },
    { reraRegistrationId: { $exists: true, $nin: [null, ''] } },
  ],
});

/**
 * MongoDB constraints for builders shown in public discovery surfaces (e.g. home scroller).
 * Includes self-registered completed profiles and admin-approved builders with display data.
 */
const getDiscoverableBuilderFilter = () => ({
  isActive: { $ne: false },
  name: { $exists: true, $nin: [null, ''] },
  $and: [
    {
      $or: [{ registrationStatus: 'completed' }, { status: 'approved' }],
    },
    hasDisplayableBuilderProfileFields(),
  ],
});

/**
 * MongoDB constraints for agents shown in public discovery surfaces.
 * Requires a completed registration and core profile fields (name, agency, city).
 * reraNumber is optional — excluded from discoverability requirements.
 */
const getDiscoverableAgentFilter = () => ({
  role: 'agent',
  isActive: { $ne: false },
  registrationStatus: 'completed',
  name: { $exists: true, $nin: [null, ''] },
  agencyName: { $exists: true, $nin: [null, ''] },
  cityofInterest: { $exists: true, $nin: [null, ''] },
});

/**
 * Merge discoverable constraints into an existing Mongo filter.
 * @param {Object} mongoFilter
 * @param {Object} filter - Request query filter
 * @param {'builder'|'agent'} profileType
 */
const applyDiscoverableProfileFilter = (mongoFilter, filter, profileType) => {
  if (shouldIncludeIncompleteProfiles(filter)) {
    return mongoFilter;
  }

  const discoverableFilter =
    profileType === 'agent' ? getDiscoverableAgentFilter() : getDiscoverableBuilderFilter();

  if (profileType === 'agent' && mongoFilter.role) {
    delete discoverableFilter.role;
  }

  if (Object.keys(mongoFilter).length === 0) {
    Object.assign(mongoFilter, discoverableFilter);
    return mongoFilter;
  }

  const existingFilter = { ...mongoFilter };
  Object.keys(mongoFilter).forEach((key) => {
    delete mongoFilter[key];
  });
  mongoFilter.$and = [existingFilter, discoverableFilter];

  return mongoFilter;
};

/**
 * Runtime check used when shaping single-record responses.
 */
const isDiscoverableBuilderProfile = (builder = {}) => {
  if (builder.isActive === false) {
    return false;
  }

  const hasCompletedRegistration = builder.registrationStatus === 'completed';
  const isAdminApproved = builder.status === 'approved';
  if (!hasCompletedRegistration && !isAdminApproved) {
    return false;
  }

  if (!hasTruthyString(builder.name)) {
    return false;
  }

  return (
    hasTruthyString(builder.company) ||
    hasTruthyString(builder.city) ||
    hasTruthyString(builder.contactInfo) ||
    hasTruthyString(builder.reraRegistrationId)
  );
};

const isDiscoverableAgentProfile = (agent = {}) => {
  if (agent.role !== 'agent' || agent.isActive === false || agent.registrationStatus !== 'completed') {
    return false;
  }

  return (
    hasTruthyString(agent.name) &&
    hasTruthyString(agent.agencyName) &&
    hasTruthyString(agent.cityofInterest)
  );
};

export {
  applyDiscoverableProfileFilter,
  getDiscoverableAgentFilter,
  getDiscoverableBuilderFilter,
  isDiscoverableAgentProfile,
  isDiscoverableBuilderProfile,
  shouldIncludeIncompleteProfiles,
};
