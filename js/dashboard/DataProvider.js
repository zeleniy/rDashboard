/**
 * Data provider.
 * @public
 * @class
 */
class DataProvider {


  constructor(data = [], filters = {}, accessor) {

    this._data = data;
    this._filters = filters;
    this._accessor = accessor;
  }


  static fromProvider(mode, provider) {

    const data     = provider.getData();
    const filters  = provider.getFilters();
    const accessor = provider.getAccessor();

    if (mode.toLowerCase() == 'count') {
      return new CountDataProvider(data, filters, accessor);
    } else {
      return new SizeDataProvider(data, filters, accessor);
    }
  }


  getAccessor() {

    return this._accessor;
  }


  setData(data) {

    this._data = this._mungeData(data);
  }


  setFilter(accessor, comparator) {

    this._filters[accessor] = comparator;
  }


  resetFilter(accessor) {

    delete this._filters[accessor];
  }


  resetFilters() {

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


  getKey() {

    throw new Error('Method getAccessor() not implemented on ' + this.constructor.name);
  }


  filter(accessor, excludeList = []) {

    const topLevelAccessor = this.getKey();

    const data = _(this.getData()).groupBy(function(d) {
      return d[accessor];
    }).transform(function(result, value, key) {
      result.push({
        name: key,
        value: Math.round(d3.sum(value, d => d[topLevelAccessor]))
      });
    }, [])
    .filter(function(d) {
      return d.value > 0;
    }).value();

    return data;
  }


  getFilteredData(accessor, excludeList = []) {

    if (skipFilters === true) {
      return this._data;
    }

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
        return filter(d[accessor]);
      })
    })

    return data;
  }
}
