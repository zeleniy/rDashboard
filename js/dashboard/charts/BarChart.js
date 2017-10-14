class BarChart extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  constructor(options = {}) {

    super(options);

    this._gap = 5;
    this._margin = {
      top: 0,
      right: 10,
      bottom: 0,
      left: 10
    };
  }


  /**
   * @inheritdoc
   * @override
   */
  getData() {

    return _(super.getData())
      .groupBy(function(d) {
        return d;
      }).map(function(d) {
        return {
          name: d[0],
          value: d.length
        }
      }).value();
  }


  renderTo(selector) {

    super.renderTo(selector);

    this._svg = this._container
      .append('svg')
      .attr('class', 'bar-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    const data = this.getData();
    /*
     * Render bars containers.
     */
    this._barsContainers = this._canvas
      .selectAll('g.bar-container')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-container');
    /*
     * Render background bars.
     */
    this._barsBackground = this._barsContainers
      .append('rect')
      .attr('class', 'background-bar')
      .attr('x', 0)
      .attr('y', 0);
    /*
     * Render bars.
     */
    this._bars = this._barsContainers
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', 0)
      .style('fill', (d, i) => d3.schemeCategory10[i]);
    /*
     * Append labels.
     */
    this._labels = this._barsContainers.append('text')
      .attr('class', 'label')
      .text(d => d.name);
    /*
     * Append value labels.
     */
    this._valueLabels = this._barsContainers.append('text')
      .attr('class', 'label value')
      .text(d => d.value);

    this.resize();

    return this.update();
  }


  resize() {

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    this._canvas
      .attr('transform', 'translate(' + this._margin.left + ', ' + this._margin.top + ')');

    const data = this.getData();
    /*
     * Get max value.
     */
    this._xMax = d3.max(data, d => d.value);
    this._blockHeight = this.getInnerHeight() / data.length;
    this._thickness = 15;
    /*
     * Define x scale function.
     */
    this._xScale = d3.scaleLinear()
      .range([0, this.getInnerWidth()])
      .domain([0, this._xMax]);
    /*
     * Render bars containers.
     */
    this._barsContainers
      .attr('transform', function(d, i) {
        return 'translate(0, ' + (i * this._blockHeight) + ')';
      }.bind(this));
    /**
     *
     */
    this._yOffset = this._blockHeight / 2 - this._thickness / 2;
    /*
     * Render background bars.
     */
    this._barsBackground
      .attr('transform', 'translate(0, ' + this._yOffset + ')')
      .attr('width', d => this._xScale(this._xMax))
      .attr('height', this._thickness);
    /*
     * Render bars.
     */
    this._bars
      .attr('width', d => this._xScale(d.value))
      .attr('height', this._thickness)
      .attr('transform', 'translate(0, ' + this._yOffset + ')')
      .style('fill', (d, i) => d3.schemeCategory10[i]);
    /*
     * Append labels.
     */
    this._labels
      .attr('dy', this._yOffset - this._gap)

    /*
     * Append value labels.
     */
    this._valueLabels
      .attr('x', this._xScale(this._xMax))
      .attr('dy', this._yOffset - this._gap)
  }


  update() {

    return this;
  }
}
