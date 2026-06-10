const hasTruthyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isTruthyQueryFlag = (value) => value === true || value === 'true';

/**
 * Whether list endpoints should skip discoverable-profile filtering.
 * Admin and internal tools pass includeIncomplete=true to list every record.
 */
const shouldIncludeIncompleteProfiles = (filter = {}) =>
  isTruthyQueryFlag(filter.includeIncomplete) || Boolean(filter.registrationStatus);

/**
 * MongoDB constraints for builders shown in public discovery surfaces (e.g. home scroller).
 * Requires a completed registration and enough profile data to display meaningfully.
 */
const getDiscoverableBuilderFilter = () => ({
  isActive: { $ne: false },
  registrationStatus: 'completed',
  name: { $exists: true, $nin: [null, ''] },
  $or: [
    { company: { $exists: true, $nin: [null, ''] } },
    { city: { $exists: true, $nin: [null, ''] } },
    { contactInfo: { $exists: true, $nin: [null, ''] } },
    { reraRegistrationId: { $exists: true, $nin: [null, ''] } },
  ],
});

/**
 * MongoDB constraints for agents shown in public discovery surfaces.
 */
const getDiscoverableAgentFilter = () => ({
  role: 'agent',
  isActive: { $ne: false },
  registrationStatus: 'completed',
  name: { $exists: true, $nin: [null, ''] },
  contactNumber: { $exists: true, $nin: [null, ''] },
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
  if (builder.isActive === false || builder.registrationStatus !== 'completed') {
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
    hasTruthyString(agent.contactNumber) &&
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
