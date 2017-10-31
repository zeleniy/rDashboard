/**
 * Map.
 * @public
 * @class
 */
function TimeLine(options) {

  Widget.call(this, options);

  this._xScale = d3.scaleTime();

  var self = this;
  this._brush = d3.brushX()
    .on('brush', function() {
      return self._brushMoveEventHandler();
    }).on('end', function() {
      return self._brushEndEventHandler();
    });

  this._ignoreMoveEvent = true;
  this._height = 50;
  this._margin = {
    top: 0,
    right: 10,
    bottom: 25,
    left: 10
  };
}


TimeLine.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.render = function() {

  this._container = d3.select(this._config.get('placeholder'));

  this._svg = this._container
    .append('svg')
    .attr('class', 'time-line');

  this._canvas = this._svg
    .append('g')
    .attr('class', 'canvas');

  this._xAxisContainer = this._canvas
    .append('g')
    .attr('class', 'axis x-axis');

  this._brushContainer = this._canvas
    .append('g')
    .attr('class', 'brush');

  this._handle = this._brushContainer
    .selectAll('.custom-handle')
    .data([{type: 'w'}, {type: 'e'}])
    .enter()
    .append('path')
    .attr('class', 'custom-handle');

  this.update();

  this.resize();

  return this;
}


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.resize = function() {

  var self = this;

  var width = this.getInnerWidth();
  var height = this._height;
  var margin = this.getMargin();

  this._svg
    .attr('width', this.getOuterWidth())
    .attr('height', height);

  this._canvas
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  this._xScale
    .range([0, width]);

  var xAxis = d3.axisBottom(this._xScale);

  this._xAxisContainer
    .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
    .call(xAxis);

  this._brush
    .extent([[0, 0], [width, height]]);

  var extent = (this._extent || this._xScale.domain()).map(this._xScale);
  this._ignoreMoveEvent = true;

  this._brushContainer
    .call(this._brush)
    .call(this._brush.move, extent);

  this._handle
    .attr('d', function(d) {
      return self._getHandlePathString(d);
    });

  XTicks.getInstance(xAxis, this._xAxisContainer)
    .rarefy();

  return this;
}


TimeLine.prototype._getHandlePathString = function(d) {

  var height = this._height;

  var e = Number(d.type == 'e');
  var x = e ? 1 : -1;
  var y = height / 2;

  return 'M' + (.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8);
}


TimeLine.prototype._brushMoveEventHandler = function() {

  this._extent = d3.event.selection.map(this._xScale.invert);

  var height = this._height;
  var x = this._xScale;

  var s = d3.event.selection;
  if (s == null) {
    this._handle.attr('display', 'none');
  } else {
    var sx = s.map(x.invert);
    this._handle.attr('display', null).attr('transform', function(d, i) { return 'translate(' + [ s[i], - height / 4] + ')'; });
  }
}


TimeLine.prototype._brushEndEventHandler = function() {

  if (this._ignoreMoveEvent === true) {
    return this._ignoreMoveEvent = false;
  }

  var min = this._extent[0];
  var max = this._extent[1];

  var format = 'D/M/YYYY HH:mm:ss';

  this._dashboard.setDataFilter(this.getAccessor(), function(d) {
    return d >= min && d <= max;
  }, moment(min).format(format) + ' - ' + moment(max).format(format));
}


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.update = function() {

  var accessor = this.getDataKey();
  var dataProvider = this._dashboard.getDataProvider();

  var defaultExtent = d3.extent(dataProvider.getData(), function(d) {
    return d[accessor];
  });

  var currentExtent = d3.extent(dataProvider.getFilteredData(), function(d) {
    return d[accessor];
  });

  this._xScale.domain(defaultExtent);

  var isResetRequest = defaultExtent[0] == currentExtent[0] &&
    defaultExtent[1] == currentExtent[1] &&
    this._ignoreMoveEvent == false;

  if (isResetRequest) {
    this._ignoreMoveEvent = true;

    this._brushContainer
      .call(this._brush.move, [0, this.getInnerWidth()]);
  }

  return this;
}
