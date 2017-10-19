/**
 * Dashboard.
 * @public
 * @class
 */
class Dashboard {


  constructor(options) {

    this._config = new Config(options);

    this._charts = [];
    this._filters = {};

    d3.selectAll('.tiles-mode-filter input')
      .on('change', this.tilesModeChangeEventHandler.bind(this));

    d3.select(window).on('resize', function() {
      this.resize();
    }.bind(this))
  }


  _mungeData() {

    this._charts.forEach(function(chart) {
      var accessor = chart.getAccessor();
      if ('munge' in chart) {

        var mungedData = chart.munge();
        this._data.forEach((d, i) => d[accessor] = mungedData[i]);
      }
    }.bind(this));
  }


  /**
   * Render dashboard components.
   * @public
   * @returns {Dashboard}
   */
  render() {
    /*
     * Munge data.
     * See https://en.wikipedia.org/wiki/Data_wrangling
     */
    this._mungeData();
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
      const values = _(this._data)
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

    delete this._filters[accessor];
    this.update();

    return this;
  }


  resize() {

    this._charts.forEach(function(chart) {
      chart.resize();
    });
  }


  tilesModeChangeEventHandler(d, i, set) {

    this._charts
      .find(chart => chart.constructor.name === Tiles.name)
      .setMode(d3.select(set[i]).attr('value'))
      .update();
  }


  addChart(chart) {

    this._charts.push(chart.setDashboard(this));
    return this;
  }


  setData(data) {

    this._data = data;
    return this;
  }


  /**
   * Set data filter.
   * @public
   * @param {String} name - filter name.
   * @param {Function} comparator - filter function.
   * @param {Boolean} [isSilent=false]
   * @retuns {Dashboard}
   */
  setDataFilter(accessor, comparator, isSilent = false) {
    /*
     * Remove filter button if any.
     */
    this._removeFilterButton(accessor);

    this._filters[accessor] = comparator;

    if (isSilent === false) {
      /*
       * Render new filter button.
       */
      const self = this;
      d3.select('.filters-list')
        .append('div')
        .datum(accessor)
        .attr('class', 'filter')
        .text(String)
        .append('span')
        .attr('class', 'filter-remove')
        .text('x')
        .on('click', function() {
          self._resetFilterButton(accessor);
        });
    }

    this.update();
  }


  update() {

    this._charts.forEach(function(chart) {
      chart.update();
    });
  }


  getData(excludeList = []) {

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
