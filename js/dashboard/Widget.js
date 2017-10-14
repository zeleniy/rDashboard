/**
 * Widget/chart basic class.
 * @public
 * @abstract
 * @class
 */
class Widget {


  /**
   * @public
   * @constructor
   * @param {Object} options
   */
  constructor(options = {}) {

    this._config = new Config(options);
    this._margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }


  /**
   * Set parent dashboard.
   * @public
   * @param {Dashboard} dashboard
   * @returns {Widget}
   */
  setDashboard(dashboard) {

    this._dashboard = dashboard;
    return this;
  }


  /**
   * Get chart outer width.
   * @returns {Number}
   */
  getOuterWidth() {

    return this._container
      .node()
      .getBoundingClientRect()
      .width;
  }


  /**
   * Get chart inner width.
   * @returns {Number}
   */
  getInnerWidth() {

    return this._container
      .node()
      .getBoundingClientRect()
      .width - this._margin.left - this._margin.right;
  }


  /**
   * Get chart outer height.
   * @returns {Number}
   */
  getOuterHeight() {

    return this._container
      .node()
      .getBoundingClientRect()
      .height;
  }


  /**
   * Get chart inner height.
   * @returns {Number}
   */
  getInnerHeight() {

    return this._container
      .node()
      .getBoundingClientRect()
      .height - this._margin.top - this._margin.bottom;
  }


  /**
   * Render widget.
   * @public
   * @param {String|HTMLElement} selector
   * @returns {Widget}
   */
  renderTo(selector) {

    this._selector = selector;
    this._container = d3.select(this._selector);

    return this;
  }


  /**
   * Set click event handler.
   * @public
   * @param {Function} callback
   * @returns {Widget}
   */
  onClick(callback) {

    this._clickCallback = callback;
    return this;
  }


  /**
   * Update widget.
   * @public
   * @abstract
   * @returns {Widget}
   */
  update() {

    throw new Error('Method update() not implemented on ' + this.constructor.name);
  }


  /**
   * Update widget.
   * @public
   * @abstract
   * @returns {Widget}
   */
  resize() {

    throw new Error('Method resize() not implemented on ' + this.constructor.name);
  }


  /**
   * Get data key.
   * @public
   * @returns {String}
   */
  getDataKey() {

    return this._config.get('accessor');
  }


  /**
   * Get chart raw data.
   * @public
   * @returns {Mixed[]}
   */
  getData() {

    const key = this.getDataKey();
    return this._dashboard.getData().map(d => d[key]);
  }
}
