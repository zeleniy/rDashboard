/**
 * Dashboard.
 * @public
 * @class
 */
class Dashboard {


  constructor(options) {

    this._config = new Config(options);
    this._dataProvider = new DataProvider();
    this._tooltip = new Tooltip();
    this._charts = [];

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


  getDataProvider() {

    return this._dataProvider;
  }


  getTooltip() {

    return this._tooltip;
  }


  /**
   * Render dashboard components.
   * @public
   * @returns {Dashboard}
   */
  render() {
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
  _renderFilters() {

    const self = this;

    const container = d3.select(this._config.get('filters.placeholder'));

    this._config.get('filters.list').forEach(function(accessor) {
      /*
       * Get filter values.
       */
      const values = _(this.getData())
        .map(d => d[accessor])
        .uniq()
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
  _filterChangedEventHandler(select, accessor) {
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
  _removeFilterButton(accessor) {

    d3.select('.filters-list')
      .selectAll('.filter')
      .filter(d => d == accessor)
      .remove();
  }


  /**
   * Remove filter button.
   * @private
   * @param {String} accessor
   * @param {Boolean} resetSelect
   */
  _resetFilterButton(accessor, resetSelect = true) {
    /*
     * Reset dashboard filter.
     */
    this.resetDataFilter(accessor);

    if (resetSelect === false) {
      return;
    }

    d3.select(this._config.get('filters.placeholder'))
      .selectAll('.filter')
      .filter(d => d == accessor)
      .selectAll('option')
      .filter((d, i) => i == 0)
      .property('selected', 'selected')
  }


  /**
   * Reset data filter.
   * @public
   * @param {String} name - filter name.
   * @param {Boolean} applyCallback
   * @retuns {Dashboard}
   */
  resetDataFilter(accessor, applyCallback = true) {
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
  resetAllFilters() {

    _(this._dataProvider.getFilters()).each(function(filter, accessor) {
      this._resetFilterButton(accessor);
    }.bind(this));

    return this;
  }


  resize() {

    this._charts.forEach(function(chart) {
      chart.resize();
    });
  }


  setAccessor(accessor) {

    this._dataProvider.setAccessor(accessor);
    this.update();
  }


  _modeChangeEventHandler(node) {

    const mode = node.value[0].toUpperCase() + node.value.substring(1).toLowerCase()

    this._dataProvider.setMode(mode);

    this._charts.forEach(function(chart) {
      chart.setMode(mode);
    });

    this._charts
      .find(chart => chart.constructor.name == 'Tiles')
      .updateFilter();

    this.update();
  }


  addChart(chart) {

    this._charts.push(chart.setDashboard(this));
    return this;
  }


  setData(data) {

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
  setDataFilter(accessor, comparator, value, callback) {
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


  update() {

    this._charts.forEach(function(chart) {
      chart.update();
    });
  }


  getData() {

    return this._dataProvider.getData();
  }
}
