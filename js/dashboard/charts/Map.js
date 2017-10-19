/**
 * Map.
 * @public
 * @class
 */
class Map extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  render() {

    super.render();

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

    d3.json('data/world_countries.json', function(error, data) {

      if (error) {
        console.error(error);
      }

      this._mapData = data;
      this._mapData.features = data.features.filter(d => d.id != 'ATA');

      this._countries = this._countryLayer
        .selectAll('path')
        .data(this._mapData.features)
        .enter()
        .append('path')
        .attr('class', 'country');

      this.update();

    }.bind(this));

    return this;
  }


  /**
   * @inheritdoc
   * @override
   */
  resize() {

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();

    this._svg
      .attr('width', width)
      .attr('height', height);

    var projection = d3.geoMercator()
      .rotate([-180, 0])
      .fitSize([width, height], this._mapData);

    var path = d3.geoPath().projection(projection);

    this._countries
      .attr('d', path);

    const rScale = d3.scaleLinear()
      .range([5, Math.min(width, height) / 10])
      .domain([0, d3.max(this.getData(), d => d.value)]);

    var centroids = {};

    this.getData().forEach(function(d) {

      var centroid = path.centroid(this._mapData.features.find(function(country) {
        return d.name == country.properties.name;
      }));

      centroids[d.name] = {
        x: centroid[0],
        y: centroid[1]
      };
    }.bind(this));

    this._bubbles
      .attr('r', d => rScale(d.value))
      .attr('cx', d => centroids[d.name].x)
      .attr('cy', d => centroids[d.name].y);

    return this;
  }


  /**
   * @inheritdoc
   * @override
   */
  getData() {

    return _(super.getData())
      .groupBy(function(d) {
        return d;
      }).transform(function(r, v, k) {

        r.push({
          name: k,
          value: v.length
        });

        return r;
      }, [])
      .value();
  }


  getDomain() {

    return this.getData().map(d => d.name);
  }


  /**
   * @inheritdoc
   * @override
   */
  update() {

    const data = this.getData();

    const update = this._dataLayer
      .selectAll('circle')
      .data(data, d => d.name);

    update
      .exit()
      .remove();

    update
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('fill', d => this._colorScale(d.name))
      .on('click', function(d) {
        const value = d.name;
        this._dashboard.setDataFilter(this.getAccessor(), function(d) {
          return d == value;
        });
      }.bind(this));

    this._bubbles = this._dataLayer
      .selectAll('circle')
      .data(data, d => d.name);

    return this.resize();
  }
}
