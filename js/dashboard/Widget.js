class Widget {


  constructor(dashboard, options) {

    this._dashboard = dashboard;
    this._config = new Config(options);
  }


  renderTo(selector) {

    this._selector = selector;
    this._container = d3.select(this._selector);
  }
}
