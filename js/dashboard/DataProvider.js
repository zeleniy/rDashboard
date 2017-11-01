/**
 * Data provider.
 * @public
 * @class
 */
function DataProvider(data, filters, mode) {

  this._data = data || [];
  this._filters = filters || {};
  this._mode = mode || 'Case';
}


DataProvider.prototype.setMode = function(mode) {

  this._mode = mode;
};


DataProvider.prototype.getMode = function() {

  return this._mode;
};


DataProvider.prototype.getAccessor = function() {

  return this._accessor;
};


DataProvider.prototype.setData = function(data) {

  this._data = data;
};


DataProvider.prototype.setFilter = function(accessor, comparator, callback) {

  this._filters[accessor] = {
    comparator: comparator,
    callback: callback
  };
};


DataProvider.prototype.resetFilter = function(accessor, applyCallback) {

  applyCallback = applyCallback === undefined ? true : applyCallback;

  if (applyCallback && this._filters[accessor] && this._filters[accessor].callback) {
    this._filters[accessor].callback();
  }

  delete this._filters[accessor];
};


DataProvider.prototype.getFilters = function() {

  return this._filters;
};


DataProvider.prototype.setAccessor = function(accessor) {

  this._accessor = accessor;
};


DataProvider.prototype.getData = function() {

  return this._data;
};


DataProvider.prototype._getSummaryFunction = function() {

  var topLevelAccessor;

  if (this._mode == 'Case') {
    return function(input) {
      return input.length;
    };
  } else if (this._mode == 'Count') {
    topLevelAccessor = this._accessor ? this._accessor + this._mode : 'IdentifiedDataSources' + this._mode;
    return function(input) {
      return d3.sum(input, function(d) {
        return d[topLevelAccessor];
      });
    };
  } else {
    topLevelAccessor = this._accessor ? this._accessor + this._mode : 'DataSource' + this._mode;
    if (topLevelAccessor == 'IdentifiedDataSourcesSize') {
      topLevelAccessor = 'DataSourceSize';
    }

    return function(input) {
      return Math.round(d3.sum(input, function(d) {
        return d[topLevelAccessor];
      }) * 10) / 10;
    };
  }
};


/**
 * Get filtered and grouped by accessor data.
 * @public
 * @param {String} accessor - property name to group by
 * @param {String[]} excludeList - list of filters names to exclude
 * @param {Object[]} [data] - data to group
 * @returns {Object[]}
 */
DataProvider.prototype.getGroupedData = function(accessor, excludeList, data) {

  var summary = this._getSummaryFunction();

  return _.chain(data || this.getFilteredData(excludeList))
    .groupBy(function(d) {
      return d[accessor];
    }).map(function(value, key) {
      return {
        name: key,
        value: summary(value)
      };
    }).filter(function(d) {
      return d.value > 0;
    }).value()
    .sort(function(a, b) {
      return b.value - a.value;
    });
};


/**
 * Get filtered data.
 * @public
 * @param {String[]} excludeList - list of filters names to exclude
 * @returns {Object[]}
 */
DataProvider.prototype.getFilteredData = function(excludeList) {

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
    });
  });

  return data;
};
