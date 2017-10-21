/**
 * Tree map.
 * @public
 * @class
 */
class TreeMap extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  getData() {

    return {
      'name': 'flare',
      'children': super.getData()
    }
  }


  getColorDomain() {

    return super.getData().map(d => d.name);
  }


  render() {

    super.render();

    this._main = this._container
      .append('div')
      .attr('class', 'treemap')
      .style('position', 'relative');

    return this.update();
  }


  resize() {

    this._nodes
      .style('left', d => d.x0 + 'px')
      .style('top', d => d.y0 + 'px')
      .style('width', d => Math.max(0, d.x1 - d.x0 - 1) + 'px')
      .style('height', d => Math.max(0, d.y1 - d.y0  - 1) + 'px')

    return this;
  }


  update() {

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const margin = this.getMargin();

    const data = this.getData();
    const total = d3.sum(data.children, d => d.value);

    const treemap = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data, (d) => d.children).sum((d) => d.value);
    const tree = treemap(root);
    const chartData = tree.leaves();

    const update = this._main
      .datum(root)
      .selectAll('.node')
      .data(chartData, d => d.data.name);
    update.exit().remove();
    update.enter()
      .append('div')
      .attr('class', 'node clickable')
      .style('background', d => this._colorScale(d.data.name))
      .on('click', function(d) {
        const value = d.data.name;
        this._dashboard.setDataFilter(this.getAccessor(), function(d) {
          return d == value;
        });
      }.bind(this))
      .each(function(d, i) {
        const persent = Math.round(d.value / total * 1000) / 10;
        if (persent > 10) {
          d3.select(this)
            .append('div')
            .attr('class', 'node-label')
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .enter()
            .append('div')
            .text(String);
        }
      });

    this._nodes = this._main
      .selectAll('div.node');

    this._nodes
      .selectAll('.node-label')
      .data(chartData, d => d.data.name)
      .each(function(d, i) {
        const persent = Math.round(d.value / total * 1000) / 10;
        if (persent > 10) {
          d3.select(this)
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .text(String);
        }
      });

    return this.resize();
  }
}
