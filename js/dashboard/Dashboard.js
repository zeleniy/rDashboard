/**
 * Dashboard.
 * @public
 * @class
 */
function Dashboard(options) {

  this._config = new Config(options);
  this._dataProvider = new DataProvider();
  this._tooltip = new Tooltip();
  this._charts = [];
  this._mode = 'Case';

  const self = this;

  d3.selectAll('.tiles-mode-filter input')
    .on('change', function() {
      self._modeChangeEventHandler(this);
    });

  d3.selectAll('.reset-button')
    .on('click', this.resetAllFilters.bind(this));

  d3.select(window).on('resize', function() {
    this.resize();
  }.bind(this))
}


Dashboard.prototype.getMode = function() {

  return this._mode;
}


Dashboard.prototype.getDataKey = function(mode) {

  mode = mode || this._mode;

  const tile = this._charts
    .find(function(chart) {
      return chart instanceof Tiles;
    }).getActiveTile();

  if (tile) {
    return tile.getDataKey();
  } else {
    return 'DataSource' + mode;
  }
}


Dashboard.prototype.getDataProvider = function() {

  return this._dataProvider;
}


Dashboard.prototype.getTooltip = function() {

  return this._tooltip;
}


/**
 * Render dashboard components.
 * @public
 * @returns {Dashboard}
 */
Dashboard.prototype.render = function() {
  /*
   * Render filters.
   */
  this._renderFilters();
  /*
   * Render charts.
   */
  this._charts.forEach(function(chart) {
    chart.render();
  });

  return this;
}


/**
 * Render filters.
 * @private
 */
Dashboard.prototype._renderFilters = function() {

  const self = this;

  const container = d3.select(this._config.get('filters.placeholder'));

  this._config.get('filters.list').forEach(function(accessor) {
    /*
     * Get filter values.
     */
    const values = _(this.getData())
      .map(function(d) {
        return d[accessor];
      }).uniq()
      .value();
    /*
     * Prepend default empty value.
     */
    values.unshift('');
    /*
     * Render select with aoptions and set change handler.
     */
    container
      .append('select')
      .attr('class', 'filter')
      .datum(accessor)
      .on('change', function(d, i) {
        self._filterChangedEventHandler(this, d);
      }).selectAll('option')
      .data(values)
      .enter()
      .append('option')
      .attr('value', String)
      .text(String);
  }, this);
}


/**
 * Filter changed event handler.
 * @private
 * @param {HTMLSelectElement} select
 * @param {String} accessor
 */
Dashboard.prototype._filterChangedEventHandler = function(select, accessor) {
  /*
   * Get select value.
   */
  const value = select.value;
  /*
   * If value is empty we should remove button and reset filter.
   */
  if (value == '') {
    return this._resetFilterButton(accessor, false);
  }
  /*
   * Set dashboard new data filter.
   */
  this.setDataFilter(accessor, function(d) {
    return d == value;
  }, value);
}


/**
 * Remove filter button.
 * @private
 * @param {HTMLSelectElement} select
 * @param {String} accessor
 */
Dashboard.prototype._removeFilterButton = function(accessor) {

  d3.select('.filters-list')
    .selectAll('.filter')
    .filter(function(d) {
      return d == accessor;
    }).remove();
}


/**
 * Remove filter button.
 * @private
 * @param {String} accessor
 * @param {Boolean} resetSelect
 */
Dashboard.prototype._resetFilterButton = function(accessor, resetSelect) {

  if (resetSelect === undefined) {
    resetSelect = true;
  }
  /*
   * Reset dashboard filter.
   */
  this.resetDataFilter(accessor);

  if (resetSelect === false) {
    return;
  }

  d3.select(this._config.get('filters.placeholder'))
    .selectAll('.filter')
    .filter(function(d) {
      return d == accessor;
    }).selectAll('option')
    .filter(function(d, i) {
      return i == 0;
    }).property('selected', 'selected')
}


/**
 * Reset data filter.
 * @public
 * @param {String} name - filter name.
 * @param {Boolean} applyCallback
 * @retuns {Dashboard}
 */
Dashboard.prototype.resetDataFilter = function(accessor, applyCallback) {

  if (applyCallback === undefined) {
    applyCallback = true;
  }
  /*
   * Remove filter button.
   */
  this._removeFilterButton(accessor);
  /*
   * Remove filter from data provider.
   */
  this._dataProvider.resetFilter(accessor, applyCallback);

  this.update();

  return this;
}


/**
 * Reset all filters.
 * @public
 * @returns {Dashboard}
 */
Dashboard.prototype.resetAllFilters = function() {

  _(this._dataProvider.getFilters()).each(function(filter, accessor) {
    this._resetFilterButton(accessor);
  }.bind(this));

  return this;
}


Dashboard.prototype.resize = function() {

  this._charts.forEach(function(chart) {
    chart.resize();
  });
}


Dashboard.prototype.setAccessor = function(accessor) {

  this._dataProvider.setAccessor(accessor);
  this.update();
}


Dashboard.prototype._modeChangeEventHandler = function(node) {

  this._mode = node.value[0].toUpperCase() + node.value.substring(1).toLowerCase()

  this._dataProvider.setMode(this._mode);

  this._charts.forEach(function(chart) {
    chart.setMode(this._mode);
  }, this);

  this._charts
    .find(function(chart) {
      return chart instanceof Tiles;
    }).updateFilter();

  this.update();
}


Dashboard.prototype.addChart = function(chart) {

  this._charts.push(chart.setDashboard(this));
  return this;
}


Dashboard.prototype.setData = function(data) {

  this._dataProvider.setData(data);
  return this;
}


/**
 * Set data filter.
 * @public
 * @param {String} name - filter name.
 * @param {Function} comparator - filter function.
 * @param {String} [value] - filter value.
 * @param {Function} [callback] - reset button click callback.
 * @retuns {Dashboard}
 */
Dashboard.prototype.setDataFilter = function(accessor, comparator, value, callback) {
  /*
   * Remove filter button if any.
   */
  this._removeFilterButton(accessor);

  this._dataProvider.setFilter(accessor, comparator, callback);
  /*
   * Render new filter button.
   */
  const button = d3.select('.filters-list')
    .append('div')
    .datum(accessor)
    .attr('class', 'filter');
  button
    .append('span')
    .text(accessor + (value ? ' = ' + value : ''));
  button.append('span')
    .attr('class', 'filter-remove')
    .text('x')
    .on('click', this._resetFilterButton.bind(this, accessor));

  this.update();
}


Dashboard.prototype.update = function() {

  this._charts.forEach(function(chart) {
    chart.update();
  });
}


Dashboard.prototype.getData = function() {

  return this._dataProvider.getData();
}
