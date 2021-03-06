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


  render() {

    super.render();

    this._svg = this._container
      .append('svg')
      .attr('class', 'bar-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    return this.update(false);
  }


  resize(animate = false) {

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    this._canvas
      .attr('transform', 'translate(' + this._margin.left + ', ' + this._margin.top + ')');

    const data = this.getData();
    const index = _(data)
      .sort((a, b) => b.value - a.value)
      .transform((result, value, index) => result[value.name] = index, {})
      .value();
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
    this._getTransition(animate, this._barsContainers)
      .attr('transform', d => 'translate(0, ' + (index[d.name] * this._blockHeight) + ')');
    /**
     *
     */
    this._yOffset = this._blockHeight / 2 - this._thickness / 2;
    /*
     * Render background bars.
     */
    this._barsContainers
      .selectAll('rect.background-bar')
      .attr('transform', 'translate(0, ' + this._yOffset + ')')
      .attr('width', d => this._xScale(this._xMax))
      .attr('height', this._thickness);
    /*
     * Render bars.
     */
    this._getTransition(animate, this._barsContainers
      .selectAll('rect.bar')
      .attr('transform', 'translate(0, ' + this._yOffset + ')'))
      .attr('width', d => this._xScale(d.value))
      .attr('height', this._thickness);
    /*
     * Append labels.
     */
    this._barsContainers
      .selectAll('text.label')
      .attr('dy', this._yOffset - this._gap)
    /*
     * Append value labels.
     */
    this._barsContainers
      .selectAll('text.value')
      .attr('x', this._xScale(this._xMax))
      .attr('dy', this._yOffset - this._gap);

    return this;
  }


  update(animate = true) {

    super.update();

    const data = this.getData();
    /*
     * Render bars containers.
     */
    var update = this._canvas
      .selectAll('g.bar-container')
      .data(data, d => d.name);
    update.exit().remove();
    var barsContainers = update
      .enter()
      .append('g')
      .attr('class', 'bar-container');
    /*
     * Render background bars.
     */
    barsContainers
      .append('rect')
      .attr('class', 'background-bar');
    /*
     * Render bars.
     */
    var cc = clickcancel();
    barsContainers
      .append('rect')
      .attr('class', 'bar clickable')
      .style('fill', d => this._colorScale(d.name))
      .call(cc);
    cc.on('click', function(d) {
      const value = d.name;
      this._dashboard.setDataFilter(this.getAccessor(), function(d) {
        return d == value;
      }, value);
    }.bind(this));
    cc.on('dblclick', function(d) {
      location.href = 'https://www.google.com';
    });
    /*
     * Append labels.
     */
    barsContainers
      .append('text')
      .attr('class', 'label')
      .text(d => d.name);
    /*
     * Append value labels.
     */
    this._valueLabels = barsContainers
      .append('text')
      .attr('class', 'label value');

    this._barsContainers = this._canvas
      .selectAll('g.bar-container');

    this._barsContainers
      .selectAll('rect.bar')
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

    const total = d3.sum(data, d => d.value);

    this._barsContainers
      .selectAll('text.value')
      .data(data, d => d.name)
      .text(function(d) {
        return d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)';
      });

    return this.resize(animate);
  }
}
