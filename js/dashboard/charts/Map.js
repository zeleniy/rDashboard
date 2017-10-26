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

    /*
     * Map scale ratio
     * d3.select('svg.map .canvas').node().getBoundingClientRect()
     * 673.7666625976562 / 436.2166748046875 = 1.5445687923308522
     */
    // const size = Math.max(width, height);
    var projection = d3.geoMercator()
      .rotate([-180, 0])
      .fitSize([width, height], this._mapData);

    // if (size > height) {
    //   this._canvas.attr('transform', 'translate(0, ' + ((height - size) / 2) + ')');
    // }

    var path = d3.geoPath().projection(projection);

    this._countries
      .attr('d', path);

    const accessor = this._config.get('accessor');
    const dataProvider = this._dashboard.getDataProvider();
    const rData = dataProvider.getGroupedData(accessor, [], dataProvider.getData());

    const rScale = d3.scaleLinear()
      .range([3, 15])
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

    super.update();

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
          .setContent(this.getTooltipContent(this._config.get('accessor'), d.name, d))
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
