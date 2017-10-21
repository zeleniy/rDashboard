/**
 * Dashboard.
 * @public
 * @class
 */
class Dashboard {


  constructor(options) {

    this._config = new Config(options);
    this._dataProvider = new CountDataProvider();
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
    })
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
     * Remove filter button.
     */
    this._removeFilterButton(accessor);
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
   * @retuns {Dashboard}
   */
  resetDataFilter(accessor) {

    this._dataProvider.resetFilter(accessor);
    this.update();

    return this;
  }


  /**
   * Reset all filters.
   * @public
   * @returns {Dashboard}
   */
  resetAllFilters() {

    _(this._dataProvider.getFilters()).each(function(comparator, accessor) {
      this._resetFilterButton(accessor);
    }.bind(this));

    return this;
  }


  resize() {

    this._charts.forEach(function(chart) {
      chart.resize();
    });
  }


  _modeChangeEventHandler(node) {

    this._dataProvider = DataProvider.getInstance(
      node.value,
      this._dataProvider.getData(),
      this._dataProvider.getFilters()
    );

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
   * @retuns {Dashboard}
   */
  setDataFilter(accessor, comparator) {
    /*
     * Remove filter button if any.
     */
    this._removeFilterButton(accessor);

    this._dataProvider.setFilter(accessor, comparator);
    /*
     * Render new filter button.
     */
    d3.select('.filters-list')
      .append('div')
      .datum(accessor)
      .attr('class', 'filter')
      .text(String)
      .append('span')
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


  getFilteredData(accessor, excludeList = []) {

    return this._dataProvider.getFilteredData(accessor, excludeList);
  }
}
