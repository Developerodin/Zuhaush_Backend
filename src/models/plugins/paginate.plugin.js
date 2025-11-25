/* eslint-disable no-param-reassign */

const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string|Array} [options.populate] - Populate data fields. Can be a string (comma-separated paths) or an array of objects/strings. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,) for string format.
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options) {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      // Handle both string format (comma-separated) and array format (with select options)
      if (Array.isArray(options.populate)) {
        // Array format: [{ path: 'builder', select: 'name email' }, ...] or ['builder', 'agent']
        options.populate.forEach((populateOption) => {
          if (typeof populateOption === 'string') {
            // String in array: handle nested paths like 'builder.name'
            populateOption
              .split('.')
              .reverse()
              .reduce((a, b) => {
                const populateConfig = a ? { path: b, populate: a } : { path: b };
                docsPromise = docsPromise.populate(populateConfig);
                return populateConfig;
              }, null);
          } else if (typeof populateOption === 'object' && populateOption.path) {
            // Object format with path and select: { path: 'builder', select: 'name email' }
            docsPromise = docsPromise.populate(populateOption);
          }
        });
      } else if (typeof options.populate === 'string') {
        // String format: 'builder,agent' or 'builder.name,agent.email'
        options.populate.split(',').forEach((populateOption) => {
          docsPromise = docsPromise.populate(
            populateOption
              .split('.')
              .reverse()
              .reduce((a, b) => ({ path: b, populate: a }))
          );
        });
      }
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;

