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

    return this.update();
  }


  resize() {

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

    this._slices
      .attr('d', arc);

    this._polylines
      .attr('points', function(d) {
        var position = outerArc.centroid(d);
        position[0] = radius * 0.95 * (this._getMidAngle(d) < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), position];
      }.bind(this));

    this._labels
      .attr('transform', function(d) {
        var position = outerArc.centroid(d);
        position[0] = radius * (this._getMidAngle(d) < Math.PI ? 1 : -1);
        return 'translate(' + position + ')';
      }.bind(this));

    return this;
  }


  update() {

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

    update = this._canvas
      .selectAll('polyline')
      .data(chartData, d => d.data.name);
    update.exit().remove();
    update.enter()
      .append('polyline');

    this._polylines = this._canvas
      .selectAll('polyline');

    update = this._canvas
      .selectAll('text')
      .data(chartData, d => d.data.name);
    update.exit().remove();
    update.enter()
      .append('text')
      .attr('class', 'label')
      .style('text-anchor', function(d) {
          return this._getMidAngle(d) < Math.PI ? 'start' : 'end';
      }.bind(this))
      .each(function(d) {
        d3.select(this)
          .selectAll('tspan')
          .data([d.data.name, d.data.value + ' (' + (Math.round(d.data.value / total * 1000) / 10) + '%)'])
          .enter()
          .append('tspan')
          .attr('x', 0)
          .attr('y', (d, i) => i == 0 ? 0 : '1.2em')
          .attr('dy', '-.2em')
          .text(String);
      });

    this._labels = this._canvas
      .selectAll('text');

    return this.resize();
  }


  _getMidAngle(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
