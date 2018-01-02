function PieChart(options) {

  Widget.call(this, options);

  this._legendBoxSize = 15;
  this._legendBoxGap = 2;
  this._legendBottomOffset = 5;

  this._pie = d3.pie()
    .sort(null)
    .value(function(d) {
      return d.value;
    });
}


PieChart.prototype = Object.create(Widget.prototype);


PieChart.prototype.renderTo = function(element) {

  Widget.prototype.render.call(this, element);

  this._svg = this._container
    .append('svg')
    .attr('class', 'pie-chart');

  this._canvas = this._svg
    .append('g')
    .attr('class', 'canvas');

  this._legend = this._svg
    .append('g')
    .attr('class', 'legend');

//  return this.update(false);
  return this;
};


PieChart.prototype.getInnerHeight = function() {

  return Widget.prototype.getInnerHeight.call(this) - this._legend.node().getBoundingClientRect().height - this._legendBottomOffset;
};


PieChart.prototype.resize = function(animate) {

  var outerWidth = this.getOuterWidth();
  var outerHeight = this.getOuterHeight();

  this._svg
    .attr('width', outerWidth)
    .attr('height', outerHeight);

  var labelMaxLength = this._legend.selectAll('text').nodes().reduce(function(maxLength, node) {
      return Math.max(maxLength, node.getBoundingClientRect().width);
  }, 0);

  var columnLength = labelMaxLength + this._legendBoxSize * 1.5 + this._legendBoxGap;
  var columnsPerRow = Math.floor(this.getOuterWidth() / columnLength);

  this._legend.selectAll('g')
    .attr('transform', function(d, i) {
      return 'translate(' + (i % columnsPerRow * columnLength) + ', ' + (Math.floor(i / columnsPerRow) * 20) + ')';
    });

  this._legend.selectAll('text')
    .attr('x', this._legendBoxSize + this._legendBoxGap);

  var box = this._legend.node().getBoundingClientRect();
  var offset = [(outerWidth - box.width) / 2, outerHeight - box.height - this._legendBottomOffset];

  this._legend
    .attr('transform', function() {
      return 'translate(' + offset + ')';
    });

  var innerWidth = this.getInnerWidth();
  var innerHeight = this.getInnerHeight();

  this._canvas
    .attr('transform', 'translate(' + [innerWidth / 2, innerHeight / 2] + ')');

  var radius = Math.min(innerWidth, innerHeight) / 2;

  var arc = d3.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(0);

  if (animate) {
    this._slices
      .transition()
      .duration(this._duration)
      .attrTween('d', function(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      });
  } else {
    this._slices
      .attr('d', arc);
  }

  return this;
};


PieChart.prototype.update = function(animate) {

//  animate = animate === undefined ? true : false;
  Widget.prototype.update.call(this, animate);

  var self = this;

  var data = this.getData();

  var update = this._legend
    .selectAll('g')
    .data(data, function(d) {
      return d.name;
    });
  update.exit().remove();
  var rows = update
    .enter()
    .append('g');
  rows.append('rect');
  this._legend
    .selectAll('rect')
    .data(data, function(d) {
      return d.name;
    }).attr('width', this._legendBoxSize)
    .attr('height', this._legendBoxSize)
    .attr('fill', function(d) {
      return self._colorScale(d.name);
    });
  rows.append('text')
    .attr('dy', '0.9em');

  var chartData = this._pie(data);

  update = this._canvas
    .selectAll('path')
    .data(chartData, function(d) {
      return d.data.name;
    });
  update.exit()
    .each(function(d) {
      this._current = _.clone(d);
      d.startAngle = d.endAngle;
    });

  var cc = clickcancel();
  update.enter()
    .append('path')
    .attr('class', 'slice clickable')
    .attr('fill', function(d) {
      return self._colorScale(d.data.name);
    }).call(cc)
    .each(function(d) {
      this._current = d;
    });
  cc.on('click', function(d) {
    self._clickHandler({value: d.data.name, accessor: self._config.get('accessor')})
  });
  cc.on('dblclick', function(d) {
    location.href = 'https://www.google.com';
  });

  this._slices = this._canvas
    .selectAll('path')
    .on('mouseenter', function(d) {
      self.getTooltip()
        .setContent(self.getTooltipContent(self._config.get('accessor'), d.data.name, d.data))
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

  this._legend
    .selectAll('text')
    .data(data, function(d) {
      return d.name;
    }).text(function(d) {
      return d.name + ' ' + d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)';
    });

  return this.resize(animate);
};


PieChart.prototype._getMidAngle = function(d) {

  return d.startAngle + (d.endAngle - d.startAngle) / 2;
};
