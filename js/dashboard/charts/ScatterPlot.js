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

    this._mode = 'Count';
    this._maxR = 15;
    this._minR = 3;
    this._padding = this._maxR * 2;

    this._margin = {
      top: this._maxR,
      right: this._maxR,
      bottom: 20,
      left: 5
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


  getData() {

    return this._dashboard
      .getDataProvider()
      .getFilteredData();
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
      .attr('y', 11);

    this._xAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._yAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._xAxisAppendix = this._canvas
      .append('line')
      .attr('class', 'axis-appendix');

    this._yAxisAppendix = this._canvas
      .append('line')
      .attr('class', 'axis-appendix');

    return this.update(false);
  }


  _getYAccessor() {

    if (this.getMode() == 'Count') {
      return 'DataSourceSize';
    } else {
      return 'DataSourceCount';
    }
  }


  _getYAxisLabel() {

    if (this.getMode() == 'Count') {
      return 'Data Source Size';
    } else {
      return 'Data Source Count';
    }
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

    const x = this._config.get('xAccessor');
    const y = this._getYAccessor();
    const r = this._getRadiusKey();
    const color = this._config.get('colorAccessor');

    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    const yDomain = d3.extent(data, d => d[y]);
    const yScale = d3.scaleLinear()
      .range([innerHeight, this._padding])
      .domain(yDomain);

    const yAxis = d3.axisLeft(yScale)
    this._yAxisContainer
      .attr('transform', 'translate(' + [0, - this._padding] + ')')
      .call(yAxis);

    YTicks.getInstance(yAxis, this._yAxisContainer)
      .rarefy();

    margin = this.getMargin();

    const rAccessor = this._getRadiusKey();
    const rScale = d3.scaleLinear()
      .range([this._minR, this._maxR])
      .domain([0, d3.max(this._dashboard.getData(), d => d[rAccessor])]);

    const xDomain = d3.extent(data, d => d[x]);
    const xScale = d3.scaleTime()
      .range([0, this.getInnerWidth() - this._padding])
      .domain(xDomain);

    this._getTransition(animate, this._dots
      .attr('cx', d => xScale(d[x]) + this._padding)
      .attr('cy', d => yScale(d[y]) - this._padding))
      .attr('r', d => rScale(d[r]));

    const xAxis = d3.axisBottom(xScale);

    this._xAxisContainer
      .attr('transform', 'translate(' + [this._padding, this.getInnerHeight()] + ')')
      .call(xAxis);

    this._yLabel
      .text(this._getYAxisLabel())
      .attr('x', - this._yLabel.node().getBoundingClientRect().height)

    this._xLabel
      .attr('x', this.getInnerWidth())
      .attr('y', this.getInnerHeight() - 2);

    XTicks.getInstance(xAxis, this._xAxisContainer)
      .rarefy();

    this._canvas
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    this._xAxisAppendix
      .attr('x1', 0)
      .attr('y1', innerHeight + 0.5)
      .attr('x2', this._padding)
      .attr('y2', innerHeight + 0.5)

    this._yAxisAppendix
      .attr('x1', 0.5)
      .attr('y1', innerHeight - this._padding)
      .attr('x2', 0.5)
      .attr('y2', innerHeight)
  }


  /**
   * @inheritdoc
   * @override
   */
  update(animate = true) {

    super.update();

    const data = this.getData();

    const x = this._config.get('xAccessor');
    const y = this._config.get('yAccessor');
    const color = this._config.get('colorAccessor');

    const update = this._canvas
      .selectAll('circle.dot')
      .data(data, d => d['CaseID']);

    update.exit()
      .remove();

    update.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('fill', d => this._colorScale(d[color]));

    this._dots = this._canvas
      .selectAll('circle.dot')
      .on('mouseenter', function(d) {
        this.getTooltip()
          .setContent(this.getTooltipContent(this._config.get('colorAccessor'), d[color], d))
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
