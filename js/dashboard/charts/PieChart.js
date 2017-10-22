class PieChart extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  constructor(options = {}) {

    super(options);

    this._pie = d3.pie()
      .sort(null)
      .value(d => d.value);
  }


  render() {

    super.render();

    this._svg = this._container
      .append('svg')
      .attr('class', 'pie-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    return this.update(false);
  }


  resize(animate = true) {

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const radius = Math.min(width, height) / 2 * 0.75;

    this._svg
      .attr('width', width)
      .attr('height', height);

    this._canvas
      .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')');

    var arc = d3.arc()
      .outerRadius(radius * 0.9)
      .innerRadius(0);

    var outerArc = d3.arc()
      .outerRadius(radius * 2)
      .innerRadius(0);

    if (animate) {
      this._slices
        .transition()
        .duration(this._duration)
        .attrTween('d', function(d) {
          var i = d3.interpolate(this._current, d);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          }
        });
    } else {
      this._slices
        .attr('d', arc);
    }

    return this;
  }


  update(animate = true) {

    const data = this.getData();
    const total = d3.sum(data, d => d.value);
    const chartData = this._pie(data);

    var update = this._canvas
      .selectAll('path')
      .data(chartData, d => d.data.name);
    update.exit().remove();
    update.enter()
      .append('path')
      .attr('class', 'slice clickable')
      .attr('fill', d => this._colorScale(d.data.name))
      .on('click', function(d) {
        const value = d.data.name;
        this._dashboard.setDataFilter(this.getAccessor(), function(d) {
          return d == value;
        });
      }.bind(this));

    this._slices = this._canvas
      .selectAll('path')
      .on('mouseenter', function(d) {
        this.getTooltip()
          .setContent(d.data.name + ': ' + d.data.value)
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


  _getMidAngle(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
