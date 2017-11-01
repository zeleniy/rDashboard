/**
 * Tree map.
 * @public
 * @class
 */
function TreeMap(options) {

  Widget.call(this, options);
}


TreeMap.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
TreeMap.prototype.getData = function() {

  return {
    'name': 'flare',
    'children': Widget.prototype.getData.call(this)
  };
};


TreeMap.prototype.render = function() {

  Widget.prototype.render.call(this);

  this._main = this._container
    .append('div')
    .attr('class', 'treemap')
    .style('position', 'relative');

  return this.update(false);
};


TreeMap.prototype.resize = function(animate) {

  var width = this.getOuterWidth();
  var height = this.getOuterHeight();
  var margin = this.getMargin();

  var data = this.getData();

  var treemap = d3.treemap().size([width, height]);
  var root = d3.hierarchy(data, function(d) {
    return d.children;
  }).sum(function(d) {
    return d.value;
  });

  var tree = treemap(root);
  var chartData = data.children.length ? tree.leaves() : [];

  this._getTransition(animate, this._nodes
    .data(chartData))
    .style('left', function(d) {
      return d.x0 + 'px';
    }).style('top', function(d) {
      return d.y0 + 'px';
    }).style('width', function(d) {
      return Math.max(0, d.x1 - d.x0 - 1) + 'px';
    }).style('height', function(d) {
      return Math.max(0, d.y1 - d.y0  - 1) + 'px';
    });

  return this;
};


TreeMap.prototype.update = function(animate) {

  animate = animate === undefined ? true : false;
  Widget.prototype.update.call(this, animate);

  var self = this;

  var width = this.getOuterWidth();
  var height = this.getOuterHeight();
  var margin = this.getMargin();

  var data = this.getData();
  var total = d3.sum(data.children, function(d) {
    return d.value;
  });

  var treemap = d3.treemap().size([width, height]);
  var root = d3.hierarchy(data, function(d) {
    return d.children;
  }).sum(function(d) {
    return d.value;
  });

  var tree = treemap(root);
  var chartData = data.children.length ? tree.leaves() : [];

  var update = this._main
    .datum(root)
    .selectAll('.node')
    .data(chartData, function(d) {
      return d.data.name;
    });
  update.exit().remove();

  var cc = clickcancel();
  update.enter()
    .append('div')
    .attr('class', 'node clickable')
    .style('background-color', function(d) {
      return self._colorScale(d.data.name);
    })
    .each(function(d, i) {
      var persent = Math.round(d.value / total * 1000) / 10;
      // if (persent > 10) {
        d3.select(this)
          .append('div')
          .attr('class', 'node-label')
          .selectAll('div')
          .data([d.data.name, d.data.value + ' (' + persent + '%)'])
          .enter()
          .append('div');
      // }
    }).call(cc);

  cc.on('click', function(d) {
    var value = d.data.name;
    self._dashboard.setDataFilter(self.getAccessor(), function(d) {
      return d == value;
    }, value);
  });
  cc.on('dblclick', function(d) {
    location.href = 'https://www.google.com';
  });

  this._nodes = this._main
    .selectAll('div.node')
    .data(chartData, function(d) {
      return d.data.name;
    }).on('mouseenter', function(d) {
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

  this._nodes
    .selectAll('.node-label')
    .data(chartData, function(d) {
      return d.data.name;
    }).each(function(d, i) {
      var persent = Math.round(d.value / total * 1000) / 10;
      // if (persent > 10) {
        d3.select(this)
          .selectAll('div')
          .data([d.data.name, d.data.value + ' (' + persent + '%)'])
          .text(String);
      // } else {
      //   d3.select(this)
      //     .selectAll('div')
      //     .data(['', ''])
      //     .text(String);
      // }
    });

  return this.resize(animate);
};
