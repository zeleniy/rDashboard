class PieChart extends Widget {


  /**
   * @inheritdoc
   * @override
   */
  constructor(options = {}) {

    super(options);

    this._legendBoxSize = 15;
    this._legendBoxGap = 2;
    this._legendBottomOffset = 5;

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

    this._legend = this._svg
      .append('g')
      .attr('class', 'legend');

    return this.update(false);
  }


  getInnerHeight() {

    return super.getInnerHeight() - this._legend.node().getBoundingClientRect().height - this._legendBottomOffset;
  }


  resize(animate = true) {

    const outerWidth = this.getOuterWidth();
    const outerHeight = this.getOuterHeight();

    this._svg
      .attr('width', outerWidth)
      .attr('height', outerHeight);

    var labelMaxLength = this._legend.selectAll('text').nodes().reduce(function(maxLength, node) {
        return Math.max(maxLength, node.getBoundingClientRect().width)
    }, 0);

    var columnLength = labelMaxLength + this._legendBoxSize * 1.5 + this._legendBoxGap;
    var columnsPerRow = Math.floor(this.getOuterWidth() / columnLength);

    this._legend.selectAll('g')
      .attr('transform', function(d, i) {
        return 'translate(' + (i % columnsPerRow * columnLength) + ', ' + (Math.floor(i / columnsPerRow) * 20) + ')';
      });

    this._legend.selectAll('text')
      .attr('x', this._legendBoxSize + this._legendBoxGap);

    const box = this._legend.node().getBoundingClientRect();
    const offset = [(outerWidth - box.width) / 2, outerHeight - box.height - this._legendBottomOffset];

    this._legend
      .attr('transform', () => 'translate(' + offset + ')');

    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    this._canvas
      .attr('transform', 'translate(' + [innerWidth / 2, innerHeight / 2] + ')');

    const radius = Math.min(innerWidth, innerHeight) / 2;

    var arc = d3.arc()
      .outerRadius(radius * 0.9)
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

    var update = this._legend
      .selectAll('g')
      .data(data, d => d.name);
    update.exit().remove();
    var rows = update.enter()
      .append('g');
    rows.append('rect')
      .attr('width', this._legendBoxSize)
      .attr('height', this._legendBoxSize)
      .attr('fill', d => this._colorScale(d.name));
    rows.append('text')
      .attr('dy', '0.9em');

    const chartData = this._pie(data);

    update = this._canvas
      .selectAll('path')
      .data(chartData, d => d.data.name);
    update.exit()
      .each(function(d) {
        this._current = _.clone(d);
        d.startAngle = d.endAngle;
      });
    update.enter()
      .append('path')
      .attr('class', 'slice clickable')
      .attr('fill', d => this._colorScale(d.data.name))
      .on('click', function(d) {
        const value = d.data.name;
        this._dashboard.setDataFilter(this.getAccessor(), function(d) {
          return d == value;
        });
      }.bind(this))
      .each(function(d) {
        this._current = d;
      });

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

    const total = d3.sum(data, d => d.value);

    this._legend
      .selectAll('text')
      .data(data)
      .text(d => d.name + ' ' + d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)');

    return this.resize(animate);
  }


  _getMidAngle(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
