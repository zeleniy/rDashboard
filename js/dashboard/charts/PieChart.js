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

    console.log(this.getOuterWidth(), this.getOuterHeight())
    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const radius = Math.min(width, height) / 2;

    this._svg = this._container
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas')
      .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')');

    var color = d3.scaleOrdinal(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    var pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var arc = this._canvas.selectAll('.arc')
      .data(pie(this.getData()))
      .enter().append('g')
        .attr('class', 'arc');

    arc.append('path')
        .attr('d', path)
        .attr('fill', d => color(d.data.value));

    arc.append('text')
        .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
        .attr('dy', '0.35em')
        .text(function(d) { return d.data.value; });
  }
}
