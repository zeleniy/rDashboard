function BarChart(options) {

  Widget.call(this, options);

  this._gap = 5;
  this._margin = {
    top: 0,
    right: 10,
    bottom: 0,
    left: 10
  };
}


BarChart.prototype = Object.create(Widget.prototype);


BarChart.prototype.render = function() {

  Widget.prototype.render.call(this);

  this._svg = this._container
    .append('svg')
    .attr('class', 'bar-chart');

  this._canvas = this._svg
    .append('g')
    .attr('class', 'canvas');

  return this.update(false);
};


BarChart.prototype.resize = function(animate) {

  var self = this;

  this._svg
    .attr('width', this.getOuterWidth())
    .attr('height', this.getOuterHeight());

  this._canvas
    .attr('transform', 'translate(' + this._margin.left + ', ' + this._margin.top + ')');

  var data = this.getData();
  var index = _.chain(data)
    .sort(function(a, b) {
      return b.value - a.value;
    }).reduce(function(result, value, index) {
      result[value.name] = index; return result;
    }, {}).value();
  /*
   * Get max value.
   */
  this._xMax = d3.max(data, function(d) {
    return d.value;
  });

  this._blockHeight = this.getInnerHeight() / data.length;
  this._thickness = 15;
  /*
   * Define x scale function.
   */
  this._xScale = d3.scaleLinear()
    .range([0, this.getInnerWidth()])
    .domain([0, this._xMax]);
  /*
   * Render bars containers.
   */
  this._getTransition(animate, this._barsContainers)
    .attr('transform', function(d) {
      return 'translate(0, ' + (index[d.name] * self._blockHeight) + ')';
    });
  /**
   *
   */
  this._yOffset = this._blockHeight / 2 - this._thickness / 2;
  /*
   * Render background bars.
   */
  this._barsContainers
    .selectAll('rect.background-bar')
    .attr('transform', 'translate(0, ' + this._yOffset + ')')
    .attr('width', function() {
      return self._xScale(self._xMax);
    })
    .attr('height', this._thickness);
  /*
   * Render bars.
   */
  this._getTransition(animate, this._barsContainers
    .selectAll('rect.bar')
    .attr('transform', 'translate(0, ' + this._yOffset + ')'))
    .attr('width', function(d) {
      return self._xScale(d.value);
    })
    .attr('height', this._thickness);
  /*
   * Append labels.
   */
  this._barsContainers
    .selectAll('text.label')
    .attr('dy', this._yOffset - this._gap);
  /*
   * Append value labels.
   */
  this._barsContainers
    .selectAll('text.value')
    .attr('x', this._xScale(this._xMax))
    .attr('dy', this._yOffset - this._gap);

  return this;
};


BarChart.prototype.update = function(animate) {

  animate = animate === undefined ? true : false;
  Widget.prototype.update.call(this);

  var self = this;

  var data = this.getData();
  /*
   * Render bars containers.
   */
  var update = this._canvas
    .selectAll('g.bar-container')
    .data(data, function(d) {
      return d.name;
    });
  update.exit().remove();
  var barsContainers = update
    .enter()
    .append('g')
    .attr('class', 'bar-container');
  /*
   * Render background bars.
   */
  barsContainers
    .append('rect')
    .attr('class', 'background-bar');
  /*
   * Render bars.
   */
  var cc = clickcancel();
  barsContainers
    .append('rect')
    .attr('class', 'bar clickable')
    .style('fill', function(d) {
      return self._colorScale(d.name);
    })
    .call(cc);
  cc.on('click', function(d) {
    var value = d.name;
    self._dashboard.setDataFilter(self.getAccessor(), function(d) {
      return d == value;
    }, value);
  });
  cc.on('dblclick', function(d) {
    location.href = 'https://www.google.com';
  });
  /*
   * Append labels.
   */
  barsContainers
    .append('text')
    .attr('class', 'label')
    .text(function(d) {
      return d.name;
    });
  /*
   * Append value labels.
   */
  this._valueLabels = barsContainers
    .append('text')
    .attr('class', 'label value');

  this._barsContainers = this._canvas
    .selectAll('g.bar-container');

  this._barsContainers
    .selectAll('rect.bar')
    .data(data, function(d) {
      return d.name;
    }).on('mouseenter', function(d) {
      self.getTooltip()
        .setContent(self.getTooltipContent(self._config.get('accessor'), d.name, d))
        .show();
    })
    .on('mouseout', function(d) {
      self.getTooltip().hide();
    })
    .on('mousemove', function(d) {
      self.getTooltip().move();
    });

  var total = d3.sum(data, function(d) {
    return d.value;
  });

  this._barsContainers
    .selectAll('text.value')
    .data(data, function(d) {
      return d.name;
    }).text(function(d) {
      return d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)';
    });

  return this.resize(animate);
};
