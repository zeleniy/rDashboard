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
  }


  /**
   * @inheritdoc
   * @override
   */
  getMargin() {

    var maxR = Math.min(
      this.getOuterWidth() - this._margin.left - this._margin.right,
      this.getOuterHeight() - this._margin.top - this._margin.bottom
    ) / 10;

    return _.transform(super.getMargin(), (r, v, k) => r[k] = v + maxR);
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

    this._xAxis = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._yAxis = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    return this.resize();
  }


  resize() {

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    const margin = this.getMargin();

    this._canvas
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    const data = this.getData();

    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    var maxR = Math.min(innerWidth, innerHeight) / 10;

    var valueScale = d3.scaleLinear()
      .range([5, maxR])
      .domain([0, d3.max(data, d => d.y)]);

    var xScale = d3.scaleLinear()
      .range([0, innerWidth])
      .domain(d3.extent(data, d => d.x));

    var yScale = d3.scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(data, d => d.y)]);

    this._dots
      .attr('r', d => valueScale(d.value))
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y));

    this._xAxis
      .attr('transform', 'translate(0,' + this.getInnerHeight() + ')')
      .call(d3.axisBottom(xScale));

    this._yAxis
      .call(d3.axisLeft(yScale));
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
