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
Map.prototype.renderTo = function(element) {

  Widget.prototype.render.call(this, element);

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

//  return this.update(false);
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

  var projection = d3.geoMercator()
    .rotate([-180, 0])
    .fitSize([width, height], this._mapData);

  var path = d3.geoPath().projection(projection);

  this._countries
    .attr('d', path);

  var rData = this._dataProvider.getGroupedData(this._config.get('accessor'), [], this._dataProvider.getData());

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

  var self = this;

  d3.json('data/world_countries.json', function(error, world) {

    if (error) {
      return console.error(error);
    }

//    animate = animate === undefined ? true : false;
    Widget.prototype.update.call(self, animate);

    self._mapData = world;

    self._mapData.features = _.filter(self._mapData.features, function(d) {
      return d.id != 'ATA';
    });

    self._countries = self._countryLayer
      .selectAll('path')
      .data(self._mapData.features)
      .enter()
      .append('path')
      .attr('class', 'country');

    var data = self.getData();

    var update = self._dataLayer
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
      self._clickHandler({value: d.name, accessor: self._config.get('accessor')})
    });
    cc.on('dblclick', function(d) {
      location.href = 'https://www.google.com';
    });

    self._bubbles = self._dataLayer
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

    self.resize(animate);
  });

  return this;
};
