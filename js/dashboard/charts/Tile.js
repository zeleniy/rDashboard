class Tile extends Widget {


  constructor(dashboard, options) {

    super(dashboard, options);
  }


  setManager(tiles) {

    this._manager = tiles;
    return this;
  }


  getDataKey() {

    return this._manager.getDataKey(this._config.get('accessor'));
  }


  getData() {

    const key = this.getDataKey();
    return this._dashboard.getData().map(d => +d[key]);
  }


  getUnit() {

    const key = this._config.get('accessor') + 'Unit';
    return this._dashboard.getData()[0][key];
  }


  highlight(select) {

    if (select) {
      this._table.style('opacity', 1);
    } else {
      this._table.style('opacity', 0.2);
    }
  }


  renderTo(selector) {

    super.renderTo(selector);

    const self = this;

    this._table = this._container
      .append('table')
      .attr('class', 'tile')
      .on('click', function(d, i, selection) {
        self._clickCallback(self, this);
      }).style('background-color', this._config.get('backgroundColor'))
      .append('tbody')
      .append('tr');

    const leftSide = this._table.append('td')
      .attr('class', 'tile-left');

    var div = leftSide.append('div')
    this._valueText = div.append('span')
      .attr('class', 'tile-value');
    this._unitText = div.append('span')
      .attr('class', 'tile-unit');
    leftSide.append('div')
      .attr('class', 'summary')
      .text('100% of Total');

    const rightSide = this._table.append('td')
      .attr('class', 'tile-right');

    rightSide.append('div')
      .attr('class', 'tile-value')
      .text(48);
    rightSide.append('div')
      .attr('class', 'data-source-text')
      .text('data source(s)');
    rightSide.append('div')
      .attr('class', 'data-source')
      .text(this._config.get('name'));
    rightSide.append('div')
      .attr('class', 'summary')
      .text('100% of Total');

    this.update();

    return this;
  }


  update() {

    this._valueText.text(d3.sum(this.getData()));
    this._unitText.text(this.getUnit())
  }
}
