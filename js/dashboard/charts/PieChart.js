class PieChart extends Widget {


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
      .attr('class', 'pie-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    var pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const chartData = pie(this.getData());
    this._slices = this._canvas
      .selectAll('path')
      .data(chartData)
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('fill', (d, i) => d3.schemeCategory10[i]);

    this._polylines = this._canvas
      .selectAll('polyline')
      .data(chartData)
      .enter()
      .append('polyline');

    this._labels = this._canvas
      .selectAll('text')
      .data(chartData)
      .enter()
      .append('text')
      .attr('dy', '.35em')
      .text(function(d) {
        return d.data.name;
      }).style('text-anchor', function(d) {
          return this._getMidAngle(d) < Math.PI ? 'start' : 'end';
      }.bind(this));

      this.resize();

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
  }


  update() {

    return this;
  }


  _getMidAngle(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
