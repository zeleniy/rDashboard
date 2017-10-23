/**
 * Data provider.
 * @public
 * @class
 */
class DataProvider {


  constructor(data = [], filters = {}, mode = 'Count') {

    this._data = data;
    this._filters = filters;
    this._mode = mode;
  }


  setMode(mode) {

    this._mode = mode;
  }


  getAccessor() {

    return this._accessor;
  }


  setData(data) {

    this._data = this._mungeData(data);
  }


  setFilter(accessor, comparator, callback) {

    this._filters[accessor] = {
      comparator: comparator,
      callback: callback
    };
  }


  resetFilter(accessor, applyCallback = true) {

    if (applyCallback && this._filters[accessor].callback) {
      this._filters[accessor].callback();
    }

    delete this._filters[accessor];
  }


  getFilters() {

    return this._filters;
  }


  setAccessor(accessor) {

    this._accessor = accessor;
  }


  /**
   * Munge data.
   * @private
   * @see https://en.wikipedia.org/wiki/Data_wrangling
   */
  _mungeData(data) {

    return data.map(function(d) {

      d['CaseCreatedOn'] = moment(d['CaseCreatedOn']).toDate();
      d['DataSourceCount'] = Number(d['DataSourceCount']);
      d['DataSourceSize'] = Number(d['DataSourceSize']);

      return d;
    });
  }


  getData() {

    return this._data;
  }


  /**
   * Get filtered and grouped by accessor data.
   * @public
   * @param {String} accessor - property name to group by
   * @param {String[]} excludeList - list of filters names to exclude
   * @param {Object[]} [data] - data to group
   * @returns {Object[]}
   */
  getGroupedData(accessor, excludeList = [], data) {

    const topLevelAccessor = this._accessor ? this._accessor + this._mode : 'DataSource' + this._mode;

    return _(data || this.getFilteredData(excludeList))
      .groupBy(function(d) {
        return d[accessor];
      }).transform(function(result, value, key) {
        result.push({
          name: key,
          value: Math.round(d3.sum(value, d => d[topLevelAccessor]))
        });
      }, [])
      .filter(function(d) {
        return d.value > 0;
      }).value()
      .sort(function(a, b) {
        return b.value - a.value;
      });
  }


  /**
   * Get filtered data.
   * @public
   * @param {String[]} excludeList - list of filters names to exclude
   * @returns {Object[]}
   */
  getFilteredData(excludeList = []) {

    if (_.size(this._filters) == 0) {
      return this._data;
    }

    if (! Array.isArray(excludeList)) {
      excludeList = [excludeList];
    }

    var data = this._data.slice(0);

    _.each(this._filters, function(filter, accessor) {

      if (excludeList.length > 0 && excludeList.indexOf(accessor) != -1) {
        return;
      }

      data = data.filter(function(d) {
        return filter.comparator(d[accessor]);
      })
    })

    return data;
  }
}
