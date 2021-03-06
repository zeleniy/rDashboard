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


  render() {

    super.render();

    this._main = this._container
      .append('div')
      .attr('class', 'treemap')
      .style('position', 'relative');

    return this.update(false);
  }


  resize(animate = false) {

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const margin = this.getMargin();

    const data = this.getData();

    const treemap = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data, (d) => d.children).sum((d) => d.value);
    const tree = treemap(root);
    const chartData = data.children.length ? tree.leaves() : [];

    this._getTransition(animate, this._nodes
      .data(chartData))
      .style('left', d => d.x0 + 'px')
      .style('top', d => d.y0 + 'px')
      .style('width', d => Math.max(0, d.x1 - d.x0 - 1) + 'px')
      .style('height', d => Math.max(0, d.y1 - d.y0  - 1) + 'px')

    return this;
  }


  update(animate = true) {

    super.update();

    const width = this.getOuterWidth();
    const height = this.getOuterHeight();
    const margin = this.getMargin();

    const data = this.getData();
    const total = d3.sum(data.children, d => d.value);

    const treemap = d3.treemap().size([width, height]);
    const root = d3.hierarchy(data, (d) => d.children).sum((d) => d.value);
    const tree = treemap(root);
    const chartData = data.children.length ? tree.leaves() : [];

    const update = this._main
      .datum(root)
      .selectAll('.node')
      .data(chartData, d => d.data.name);
    update.exit().remove();

    var cc = clickcancel();
    update.enter()
      .append('div')
      .attr('class', 'node clickable')
      .style('background-color', d => this._colorScale(d.data.name))
      .each(function(d, i) {
        const persent = Math.round(d.value / total * 1000) / 10;
        // if (persent > 10) {
          d3.select(this)
            .append('div')
            .attr('class', 'node-label')
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .enter()
            .append('div');
        // }
      }).call(cc);

    cc.on('click', function(d) {
      const value = d.data.name;
      this._dashboard.setDataFilter(this.getAccessor(), function(d) {
        return d == value;
      }, value);
    }.bind(this));
    cc.on('dblclick', function(d) {
      location.href = 'https://www.google.com';
    });

    this._nodes = this._main
      .selectAll('div.node')
      .data(chartData, d => d.data.name)
      .on('mouseenter', function(d) {
        this.getTooltip()
          .setContent(this.getTooltipContent(this._config.get('accessor'), d.data.name, d.data))
          .show();
      }.bind(this))
      .on('mouseout', function(d) {
        this.getTooltip().hide();
      }.bind(this))
      .on('mousemove', function(d) {
        this.getTooltip().move();
      }.bind(this));

    this._nodes
      .selectAll('.node-label')
      .data(chartData, d => d.data.name)
      .each(function(d, i) {
        const persent = Math.round(d.value / total * 1000) / 10;
        // if (persent > 10) {
          d3.select(this)
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .text(String);
        // } else {
        //   d3.select(this)
        //     .selectAll('div')
        //     .data(['', ''])
        //     .text(String);
        // }
      });

    return this.resize(animate);
  }
}
