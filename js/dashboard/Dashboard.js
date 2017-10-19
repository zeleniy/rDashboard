/**
 * Dashboard.
 * @public
 * @class
 */
class Dashboard {


  constructor() {

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


  render() {

    this._mungeData();

    this._charts.forEach(function(chart) {
      chart.render();
    });
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
   * @param {Function} filter - filter function.
   * @retuns {Dashboard}
   */
  setDataFilter(accessor, filter) {

    this._filters[accessor] = filter;
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
