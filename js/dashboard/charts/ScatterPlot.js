/*jshint sub:true*/


/**
 * Scatter plot.
 * @public
 * @class
 */
function ScatterPlot(options) {

  Widget.call(this, options);

  this._mode = 'Count';
  this._maxR = 15;
  this._minR = 3;
  this._padding = this._maxR * 2;

  this._margin = {
    top: this._maxR,
    right: this._maxR,
    bottom: 20,
    left: 5
  };
}


ScatterPlot.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.getMargin = function() {

  var margin = _.clone(Widget.prototype.getMargin.call(this));

  margin.left += this._yAxisContainer.node().getBoundingClientRect().width;

  return margin;
};


ScatterPlot.prototype.getData = function() {

  return this._dataProvider.getFilteredData();
};


ScatterPlot.prototype.setMode = function(mode) {

  if (mode.toLowerCase() != 'case') {
    Widget.prototype.setMode.call(this, mode);
  }
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.getColorKey = function() {

  return this._config.get('colorAccessor');
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.renderTo = function(element) {

  Widget.prototype.render.call(this, element);

  this._svg = this._container
    .append('svg')
    .attr('class', 'scatter-plot');

  this._canvas = this._svg
    .append('g')
    .attr('class', 'canvas');

  this._xLabel = this._canvas
    .append('text')
    .attr('class', 'axis-label x-axis-label')
    .text(this._config.get('xLabel'));

  this._yLabel = this._canvas
    .append('text')
    .attr('class', 'axis-label y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 11);

  this._xAxisContainer = this._canvas
    .append('g')
    .attr('class', 'axis x-axis');

  this._yAxisContainer = this._canvas
    .append('g')
    .attr('class', 'axis x-axis');

  this._xAxisAppendix = this._canvas
    .append('line')
    .attr('class', 'axis-appendix');

  this._yAxisAppendix = this._canvas
    .append('line')
    .attr('class', 'axis-appendix');

//  return this.update(false);
  return this;
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.resize = function(animate) {

  var self = this;

  this._svg
    .attr('width', this.getOuterWidth())
    .attr('height', this.getOuterHeight());

  var margin = this.getMargin();

  var data = this.getData();

  var x = this._config.get('xAccessor');
  var y = this._config.get('yAccessor', undefined, [this]);
  var r = this._config.get('radiusAccessor');
  var color = this._config.get('colorAccessor');

  var innerWidth = this.getInnerWidth();
  var innerHeight = this.getInnerHeight();

  var yDomain = d3.extent(data, function(d) {
    return d[y];
  });

  var yScale = d3[this._config.get('yScale')]()
    .range([innerHeight, this._padding])
    .domain(yDomain);

  var yAxis = d3.axisLeft(yScale);
  this._yAxisContainer
    .attr('transform', 'translate(' + [0, - this._padding] + ')')
    .call(yAxis);

  YTicks.getInstance(yAxis, this._yAxisContainer)
    .rarefy();

  margin = this.getMargin();

  var rAccessor = this._config.get('radiusAccessor');
  var rMax = d3.max(this._dataProvider.getData(), function(d) {
    return d[rAccessor];
  });

  var rScale = d3.scaleLinear()
    .range([this._minR, this._maxR])
    .domain([0, rMax]);

  var xDomain = d3.extent(data, function(d) {
    return d[x];
  });

  var xScale = d3.scaleTime()
    .range([0, this.getInnerWidth() - this._padding])
    .domain(xDomain);

  this._getTransition(animate, this._dots
    .attr('cx', function(d) {
      return xScale(d[x]) + self._padding;
    }).attr('cy', function(d) {
      return yScale(d[y]) - self._padding;
    })).attr('r', function(d) {
      return rScale(d[r]);
    });

  var xAxis = d3.axisBottom(xScale);

  this._xAxisContainer
    .attr('transform', 'translate(' + [this._padding, this.getInnerHeight()] + ')')
    .call(xAxis);

  this._yLabel
    .text(this._config.get('yLabel', undefined, [this]))
    .attr('x', - this._yLabel.node().getBoundingClientRect().height);

  this._xLabel
    .attr('x', this.getInnerWidth())
    .attr('y', this.getInnerHeight() - 2);

  XTicks.getInstance(xAxis, this._xAxisContainer)
    .rarefy();

  this._canvas
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  this._xAxisAppendix
    .attr('x1', 0)
    .attr('y1', innerHeight + 0.5)
    .attr('x2', this._padding)
    .attr('y2', innerHeight + 0.5);

  this._yAxisAppendix
    .attr('x1', 0.5)
    .attr('y1', innerHeight - this._padding)
    .attr('x2', 0.5)
    .attr('y2', innerHeight);
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.update = function(animate) {

//  animate = animate === undefined ? true : false;
  Widget.prototype.update.call(this, animate);

  var self = this;

  var data = this.getData();

  var color = this._config.get('colorAccessor');

  var update = this._canvas
    .selectAll('circle.dot')
    .data(data, function(d) {
      return d['CaseID'];
    });

  update.exit()
    .remove();

  var cc = clickcancel();
  update.enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('fill', function(d) {
      return self._colorScale(d[color]);
    }).call(cc);
  cc.on('click', function(d) {
    self._clickHandler({ value: d });
  });
  cc.on('dblclick', function(d) {
    location.href = 'https://www.google.com';
  });

  this._dots = this._canvas
    .selectAll('circle.dot')
    .on('mouseenter', function(d) {
      self.getTooltip()
        .setContent(self.getTooltipContent(self._config.get('colorAccessor'), d[color], d))
        .show();
    })
    .on('mouseout', function(d) {
      self.getTooltip().hide();
    })
    .on('mousemove', function(d) {
      self.getTooltip().move();
    });

  return this.resize(animate);
};
