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

      this.update(false);

    }.bind(this));

    return this;
  }


  /**
   * @inheritdoc
   * @override
   */
  resize(animate = false) {

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

    const accessor = this._config.get('accessor');
    const dataProvider = this._dashboard.getDataProvider();
    const rData = dataProvider.getGroupedData(accessor, [], dataProvider.getData());

    const rScale = d3.scaleLinear()
      .range([5, Math.min(width, height) / 10])
      .domain([0, d3.max(rData, d => d.value)]);

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

    this._getTransition(animate, this._bubbles
      .attr('cx', d => centroids[d.name].x)
      .attr('cy', d => centroids[d.name].y))

      .attr('r', d => rScale(d.value))

    return this;
  }


  /**
   * @inheritdoc
   * @override
   */
  update(animate = true) {

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
      .attr('class', 'bubble clickable')
      .attr('fill', d => this._colorScale(d.name))
      .on('click', function(d) {
        const value = d.name;
        this._dashboard.setDataFilter(this.getAccessor(), function(d) {
          return d == value;
        }, value);
      }.bind(this));

    this._bubbles = this._dataLayer
      .selectAll('circle')
      .data(data, d => d.name)
      .on('mouseenter', function(d) {
        this.getTooltip()
          .setContent(d.name + ': ' + d.value)
          .show();
      }.bind(this))
      .on('mouseout', function(d) {
        this.getTooltip().hide();
      }.bind(this))
      .on('mousemove', function(d) {
        this.getTooltip().move();
      }.bind(this));

    return this.resize(animate);
  }
}
