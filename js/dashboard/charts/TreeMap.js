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

    const children = _(super.getData())
      .groupBy(function(d) {
        return d;
      }).map(function(d) {
        return {
          name: d[0],
          size: d.length
        }
      }).value();

    return {
      'name': 'flare',
      'children': children
    }
  }


  render() {

    this._container = d3.select(this._config.get('placeholder'));

    this._main = this._container
      .append('div')
      .attr('class', 'treemap')
      .style('position', 'relative');

    this.update();

    return this.resize();
  }


  resize() {

    const data = this.getData();

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const margin = this.getMargin();

    const treemap = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data, (d) => d.children).sum((d) => d.size);
    const tree = treemap(root);

    this._nodes
      .data(tree.leaves())
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

    const treemap = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data, (d) => d.children).sum((d) => d.size);
    const tree = treemap(root);

    this._nodes = this._main
      .datum(root)
      .selectAll('.node')
      .data(tree.leaves())
      .enter()
      .append('div')
      .attr('class', 'node')
      .style('background', this.getColor.bind(this))
      .text(d => d.data.name);

    return this;
  }
}
