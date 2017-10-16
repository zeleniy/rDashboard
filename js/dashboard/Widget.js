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

    this._colorSet = d3.schemeCategory10;

    this._margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }


  getAccessor() {

    return this._config.get('accessor');
  }


  /**
   * Get chart margin.
   * @public
   * @returns {Object}
   */
  getMargin() {

    return this._margin;
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

    const margin = this.getMargin();

    return this._container
      .node()
      .getBoundingClientRect()
      .width - margin.left - margin.right;
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

    const margin = this.getMargin();

    return this._container
      .node()
      .getBoundingClientRect()
      .height - margin.top - margin.bottom;
  }


  /**
   * Render widget.
   * @public
   * @abstract
   * @returns {Widget}
   */
  render() {

    this._container = d3.select(this._config.get('placeholder'));

    this._colorScale = d3.scaleOrdinal()
      .domain(this.getDomain())
      .range(this.getColorRange());

  }


  getDomain() {

    throw new Error('Method getDomain() not implemented on ' + this.constructor.name);
  }


  getColorRange() {

    return this.getDomain().map((d, i) => this._colorSet[i % this._colorSet.length]);
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
   * @param {String[]} excludeList - list of filters to exclude
   * @returns {Mixed[]}
   */
  getData(excludeList) {

    const key = this.getDataKey();

    return this._dashboard
      .getData(excludeList)
      .map(d => d[key]);
  }
}
