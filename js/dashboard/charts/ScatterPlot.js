/**
 * Scatter plot.
 * @public
 * @class
 */
class ScatterPlot extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  constructor(options = {}) {

    super(options);

    this._margin = {
      top: 5,
      right: 10,
      bottom: 20,
      left: 0
    };
  }


  /**
   * @inheritdoc
   * @override
   */
  getMargin() {

    const margin = _.clone(super.getMargin());

    margin.left += this._yAxisContainer.node().getBoundingClientRect().width;

    return margin;
  }


  /**
   * @inheritdoc
   * @override
   */
  getData() {

    const x = this._config.get('xAccessor');
    const y = this._config.get('yAccessor');
    const r = this._getRadiusKey();
    const color = this._config.get('colorAccessor');

    return this._dashboard
      .getDataProvider()
      .getFilteredData()
      .map(d => ({
        id: d['CaseID'],
        x: d[x],
        y: d[y],
        r: d[r],
        color: d[color]
      }));
  }


  setMode(mode) {

    if (mode.toLowerCase() != 'case') {
      super.setMode(mode)
    }
  }


  _getRadiusKey() {

    return this._config.get('radiusAccessor') +
      this._mode[0].toUpperCase() +
      this._mode.substring(1).toLowerCase();
  }


  /**
   * @inheritdoc
   * @override
   */
  getColorKey() {

    return this._config.get('colorAccessor');
  }


  /**
   * @inheritdoc
   * @override
   */
  render() {

    super.render();

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
      .attr('y', 11)
      .text(this._config.get('yLabel'));

    this._xAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._yAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    return this.update(false);
  }


  /**
   * @inheritdoc
   * @override
   */
  resize(animate = false) {

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    var margin = this.getMargin();

    const data = this.getData();

    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    const maxR = Math.min(innerWidth, innerHeight) / 10;

    const yDomain = d3.extent(data, d => d.y);
    const yScale = d3.scaleLinear()
      .range([innerHeight, 0])
      .domain(yDomain);
   /*
    * Calculate extra "space" to implement padding on Y axis.
    */
    const yExtra = yScale.invert(innerHeight - maxR) * 1.2;
    /*
     * Extend domain depending on extra "space".
     */
    yScale.domain([yDomain[0] - yExtra, yDomain[1] + yExtra])

    const yAxis = d3.axisLeft(yScale)
    this._yAxisContainer
      .call(yAxis);

    YTicks.getInstance(yAxis, this._yAxisContainer)
      .rarefy();

    margin = this.getMargin();

    const rAccessor = this._getRadiusKey();
    const rScale = d3.scaleLinear()
      .range([5, maxR])
      .domain([0, d3.max(this._dashboard.getData(), d => d[rAccessor])]);

    const xDomain = d3.extent(data, d => d.x);
    const xScale = d3.scaleTime()
      .range([0, this.getInnerWidth()])
      .domain(xDomain);

    /*
     * Calculate extra "space" to implement padding on X axis.
     */
    const xExtra = - (xDomain[0].getTime() - xScale.invert(maxR).getTime())// * 1.2;
    /*
     * Extend domain depending on extra "space".
     */
    xScale.domain([
      new Date(xDomain[0].getTime() - xExtra),
      new Date(xDomain[1].getTime() + xExtra)
    ]);

    this._getTransition(animate, this._dots
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y)))
      .attr('r', d => rScale(d.r));

    const xAxis = d3.axisBottom(xScale);

    this._xAxisContainer
      .attr('transform', 'translate(0,' + this.getInnerHeight() + ')')
      .call(xAxis);

    this._yLabel
      .attr('x', - this._yLabel.node().getBoundingClientRect().height)

    this._xLabel
      .attr('x', this.getInnerWidth())
      .attr('y', this.getInnerHeight() - 2);

    XTicks.getInstance(xAxis, this._xAxisContainer)
      .rarefy();

    this._canvas
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
  }


  /**
   * @inheritdoc
   * @override
   */
  update(animate = true) {

    const data = this.getData();

    const update = this._canvas
      .selectAll('circle.dot')
      .data(data, d => d.id);

    update.exit()
      .remove();

    update.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('fill', d => this._colorScale(d.color));

    this._dots = this._canvas
      .selectAll('circle.dot')
      .on('mouseenter', function(d) {
        this.getTooltip()
          .setContent(d.color + ': ' + d.y)
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
