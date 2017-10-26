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

    this._colorSet = this._config.get('colorScheme', d3.schemeCategory10);
    if (! Array.isArray(this._colorSet)) {
      this._colorSet = [this._colorSet];
    }

    this._duration = 1000;

    this._tips = this._config.get('tooltip', []).map(function(tip) {
      return tip.setChart(this);
    }.bind(this));

    this._title = d3.select();
    this._subtitle = d3.select();

    this._margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }


  getMode() {

    return this._mode;
  }


  getDashboard() {

    return this._dashboard;
  }


  _getTransition(animate, selection) {

    if (animate) {
      return selection.transition().duration(this._duration);
    } else {
      return selection;
    }
  }


  getTooltip() {

    return this._dashboard.getTooltip();
  }


  getTooltipContent(accessor, groupBy, d) {

    return this._tips.map(function(tip) {
      return tip.getData(accessor, groupBy, d);
    })
  }


  getConfig() {

    return this._config;
  }


  setMode(mode) {

    this._mode = mode;
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


  getTitle() {

    const title = this._config.get('title', '');
    if (_.isFunction(title)) {
      return title(this);
    } else {
      return title;
    }
  }


  getSubtitle() {

    const subtitle = this._config.get('subtitle', '');
    if (_.isFunction(subtitle)) {
      return subtitle(this);
    } else {
      return subtitle;
    }
  }


  /**
   * Render widget.
   * @public
   * @abstract
   * @returns {Widget}
   */
  render() {

    const container = d3.select(this._config.get('placeholder'));

    const title = this.getTitle();
    if (title != '') {
      this._title = container
        .append('div')
        .attr('class', 'chart-title')
        .style('text-align', this._config.get('titleAlign', 'center'))
        .text(title);
    }

    const subtitle = this.getSubtitle();
    if (subtitle != '') {
      this._title = container
        .append('div')
        .attr('class', 'chart-subtitle')
        .style('text-align', this._config.get('titleAlign', 'center'))
        .text(subtitle);
    }

    this._container = container
      .append('div')
      .attr('class', 'chart-container');

    this._colorScale = d3.scaleOrdinal()
      .domain(this.getColorDomain())
      .range(this.getColorRange());
  }


  /**
   * @inheritdoc
   * @override
   */
  getColorKey() {

    return this._config.get('accessor');
  }


  getColorDomain() {

    const accessor = this.getColorKey();
    return _(this._dashboard.getData())
      .map(d => d[accessor])
      .uniq()
      .sort()
      .value();
  }


  getColorRange() {

    return this.getColorDomain().map((d, i) => this._colorSet[i % this._colorSet.length]);
  }


  /**
   * Update widget.
   * @public
   * @abstract
   * @param {Boolean} [animate=true]
   * @returns {Widget}
   */
  update(animate = true) {

    this._title.text(this.getTitle());
    this._subtitle.text(this.getSubtitle());
  }


  /**
   * Update widget.
   * @public
   * @abstract
   * @param {Boolean} [animate=false]
   * @returns {Widget}
   */
  resize(animate = false) {

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
   * Get chart grouped data.
   * @public
   * @param {String[]} excludeList - list of filters to exclude
   * @returns {Mixed[]}
   */
  getData(excludeList) {

    return this._dashboard
      .getDataProvider()
      .getGroupedData(this.getDataKey(), excludeList);
  }
}
