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

    this._data = undefined;
    this._margin = {
      top: 0,
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

    if (this._data === undefined) {
      this._data = d3.range(10).map(function() {
        return {
          x: Math.random(),
          y: Math.random(),
          value: Math.random()
        }
      });
    }

    return this._data;
  }


  getDomain() {

    return d3.range(this.getData().length);
  }


  render() {

    super.render();

    this._svg = this._container
      .append('svg')
      .attr('class', 'scatter-plot');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    this.update();

    this._xAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._yAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    return this.resize();
  }


  resize() {

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

    const yExtra = yScale.invert(innerHeight - maxR) * 1.2;
    yScale.domain([yDomain[0] - yExtra, yDomain[1] + yExtra])

    const yAxis = d3.axisLeft(yScale)
    this._yAxisContainer
      .call(d3.axisLeft(yScale));

    YTicks.getInstance(yAxis, this._yAxisContainer)
      .rarefy();

    margin = this.getMargin();

    const rScale = d3.scaleLinear()
      .range([5, maxR])
      .domain([0, d3.max(data, d => d.value)]);

    const xDomain = d3.extent(data, d => d.x);
    const xScale = d3.scaleLinear()
      .range([0, this.getInnerWidth()])
      .domain(xDomain);

    const xExtra = xScale.invert(maxR) * 1.2;
    xScale.domain([xDomain[0] - xExtra, xDomain[1] + xExtra])

    this._dots
      .attr('r', d => rScale(d.value))
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y));

    const xAxis = d3.axisBottom(xScale);

    this._xAxisContainer
      .attr('transform', 'translate(0,' + this.getInnerHeight() + ')')
      .call(xAxis);

    XTicks.getInstance(xAxis, this._xAxisContainer)
      .rarefy();

    this._canvas
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
  }


  update() {

    const data = this.getData();

    const update = this._canvas
      .selectAll('circle')
      .data(data);

    update.exit()
      .remove();

    update.enter()
      .append('circle')
      .attr('class', 'dot');

    this._dots = this._canvas
      .selectAll('circle')
      .style('fill', (d, i) => this._colorScale(i));

    return this;
  }
}
