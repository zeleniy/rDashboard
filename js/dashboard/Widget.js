/**
 * Widget/chart base class.
 * @public
 * @abstract
 * @class
 * @param {Object} [options={}]
 */
function Widget(options) {

  this._config = new Config(options || {});

  this._colorSet = this._config.get('colorScheme', d3.schemeCategory10);
  if (! Array.isArray(this._colorSet)) {
    this._colorSet = [this._colorSet];
  }

  this._duration = 1000;

  var self = this;
  this._tips = this._config.get('tooltip', []).map(function(tip) {
    return tip.setChart(self);
  });

  this._title = d3.select();
  this._subtitle = d3.select();

  this._margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}


Widget.prototype.getMode = function() {

  return this._mode;
};


Widget.prototype.getDashboard = function() {

  return this._dashboard;
};


Widget.prototype._getTransition = function(animate, selection) {

  if (animate) {
    return selection.transition().duration(this._duration);
  } else {
    return selection;
  }
};


Widget.prototype.getTooltip = function() {

  return this._dashboard.getTooltip();
};


Widget.prototype.getTooltipContent = function(accessor, groupBy, d) {

  return this._tips.map(function(tip) {
    return tip.getData(accessor, groupBy, d);
  });
};


Widget.prototype.getConfig = function() {

  return this._config;
};


Widget.prototype.setMode = function(mode) {

  this._mode = mode;
};


Widget.prototype.getAccessor = function() {

  return this._config.get('accessor');
};


/**
 * Get chart margin.
 * @public
 * @returns {Object}
 */
Widget.prototype.getMargin = function() {

  return this._margin;
};


/**
 * Set parent dashboard.
 * @public
 * @param {Dashboard} dashboard
 * @returns {Widget}
 */
Widget.prototype.setDashboard = function(dashboard) {

  this._dashboard = dashboard;
  return this;
};


/**
 * Get chart outer width.
 * @returns {Number}
 */
Widget.prototype.getOuterWidth = function() {

  return this._container
    .node()
    .getBoundingClientRect()
    .width;
};


/**
 * Get chart inner width.
 * @returns {Number}
 */
Widget.prototype.getInnerWidth = function() {

  var margin = this.getMargin();

  return this._container
    .node()
    .getBoundingClientRect()
    .width - margin.left - margin.right;
};


/**
 * Get chart outer height.
 * @returns {Number}
 */
Widget.prototype.getOuterHeight = function() {

  return this._container
    .node()
    .getBoundingClientRect()
    .height;
};


/**
 * Get chart inner height.
 * @returns {Number}
 */
Widget.prototype.getInnerHeight = function() {

  var margin = this.getMargin();

  return this._container
    .node()
    .getBoundingClientRect()
    .height - margin.top - margin.bottom;
};


Widget.prototype.getTitle = function() {

  return this._config.get('title', '', [this]);
};


Widget.prototype.getSubtitle = function() {

  return this._config.get('subtitle', '', [this]);
};


/**
 * Render widget.
 * @public
 * @abstract
 * @returns {Widget}
 */
Widget.prototype.render = function() {

  var container = d3.select(this._config.get('placeholder'));

  var title = this.getTitle();
  if (title != '') {
    this._title = container
      .append('div')
      .attr('class', 'chart-title')
      .style('text-align', this._config.get('titleAlign', 'center'));
  }

  var subtitle = this.getSubtitle();
  if (subtitle != '') {
    this._subtitle = container
      .append('div')
      .attr('class', 'chart-subtitle')
      .style('text-align', this._config.get('titleAlign', 'center'));
  }

  this._container = container
    .append('div')
    .attr('class', 'chart-container');

  this._colorScale = d3.scaleOrdinal()
    .domain(this.getColorDomain())
    .range(this.getColorRange());
};


/**
 * @inheritdoc
 * @override
 */
Widget.prototype.getColorKey = function() {

  return this._config.get('accessor');
};


Widget.prototype.getColorDomain = function() {

  var accessor = this.getColorKey();
  return _(this._dashboard.getData())
    .map(function(d) {
      return d[accessor];
    }).uniq()
    .sort()
    .value();
};


Widget.prototype.getColorRange = function() {

  var self = this;

  return this.getColorDomain().map(function(d, i) {
    return self._colorSet[i % self._colorSet.length];
  });
};


/**
 * Update widget.
 * @public
 * @abstract
 * @param {Boolean} [animate=true]
 * @returns {Widget}
 */
Widget.prototype.update = function(animate) {

  this._title.text(this.getTitle());
  this._subtitle.text(this.getSubtitle());
};


/**
 * Update widget.
 * @public
 * @abstract
 * @param {Boolean} [animate=false]
 * @returns {Widget}
 */
Widget.prototype.resize = function(animate) {

  throw new Error('Method resize() not implemented on ' + this.constructor.name);
};


/**
 * Get data key.
 * @public
 * @returns {String}
 */
Widget.prototype.getDataKey = function() {

  return this._config.get('accessor');
};


/**
 * Get chart grouped data.
 * @public
 * @param {String[]} excludeList - list of filters to exclude
 * @returns {Mixed[]}
 */
Widget.prototype.getData = function(excludeList) {

  return this._dashboard
    .getDataProvider()
    .getGroupedData(this.getDataKey(), excludeList);
};
