/**
 * Map.
 * @public
 * @class
 */
function Map(options) {

  Widget.call(this, options);
}


Map.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
Map.prototype.render = function() {

  Widget.prototype.render.call(this);

  this._svg = this._container
    .append('svg')
    .attr('class', 'map');

  this._canvas = this._svg
    .append('g')
    .attr('class', 'canvas');

  this._countryLayer = this._canvas
    .append('g')
    .attr('class', 'country-layer');

  this._dataLayer = this._canvas
    .append('g')
    .attr('class', 'data-layer');

  var self = this;
  d3.json('data/world_countries.json', function(error, data) {

    if (error) {
      console.error(error);
    }

    self._mapData = data;
    self._mapData.features = data.features.filter(function(d) {
      return d.id != 'ATA';
    });

    self._countries = self._countryLayer
      .selectAll('path')
      .data(self._mapData.features)
      .enter()
      .append('path')
      .attr('class', 'country');

    self.update(false);
  });

  return this;
};


/**
 * @inheritdoc
 * @override
 */
Map.prototype.resize = function(animate) {

  var self = this;

  var width = this.getOuterWidth();
  var height = this.getOuterHeight();

  this._svg
    .attr('width', width)
    .attr('height', height);

  /*
   * Map scale ratio
   * d3.select('svg.map .canvas').node().getBoundingClientRect()
   * 673.7666625976562 / 436.2166748046875 = 1.5445687923308522
   */
  // var size = Math.max(width, height);
  var projection = d3.geoMercator()
    .rotate([-180, 0])
    .fitSize([width, height], this._mapData);

  // if (size > height) {
  //   this._canvas.attr('transform', 'translate(0, ' + ((height - size) / 2) + ')');
  // }

  var path = d3.geoPath().projection(projection);

  this._countries
    .attr('d', path);

  var accessor = this._config.get('accessor');
  var dataProvider = this._dashboard.getDataProvider();
  var rData = dataProvider.getGroupedData(accessor, [], dataProvider.getData());

  var rMax = d3.max(rData, function(d) {
    return d.value;
  });

  var rScale = d3.scaleLinear()
    .range([3, 15])
    .domain([0, rMax]);

  var centroids = {};

  this.getData().forEach(function(d) {

    var centroid = path.centroid(_.find(self._mapData.features, function(country) {
      return d.name == country.properties.name;
    }));

    centroids[d.name] = {
      x: centroid[0],
      y: centroid[1]
    };
  });

  this._getTransition(animate, this._bubbles
    .attr('cx', function(d) {
      return centroids[d.name].x;
    }).attr('cy', function(d) {
      return centroids[d.name].y;
    })).attr('r', function(d) {
      return rScale(d.value);
    });

  return this;
};


/**
 * @inheritdoc
 * @override
 */
Map.prototype.update = function(animate) {

  animate = animate === undefined ? true : false;
  Widget.prototype.update.call(this, animate);

  var self = this;

  var data = this.getData();

  var update = this._dataLayer
    .selectAll('circle')
    .data(data, function(d) {
      return d.name;
    });

  update
    .exit()
    .remove();

  var cc = clickcancel();
  update
    .enter()
    .append('circle')
    .attr('class', 'bubble clickable')
    .attr('fill', function(d) {
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

  this._bubbles = this._dataLayer
    .selectAll('circle')
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

  return this.resize(animate);
};
