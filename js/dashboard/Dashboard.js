class Dashboard {


  constructor() {

    this._charts = [];

    d3.selectAll('.tiles-mode-filter input')
      .on('change', this.tilesModeChangeEventHandler.bind(this));

    d3.select(window).on('resize', function() {
      this.resize();
    }.bind(this))
  }


  render() {

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


  getData() {

    return this._data;
  }
}
