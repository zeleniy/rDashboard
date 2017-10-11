class SummaryTile extends Widget {


  constructor(dashboard, options) {

    super(dashboard, options);
    // this._isSelected = true;
  }


  // isSelected() {
  //
  //   return this._isSelected;
  // }
  //
  //
  // toggle() {
  //
  //   this.highlight(! this._isSelected);
  // }


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
    div.append('span')
      .attr('class', 'tile-value')
      .text(26.1);
    div.append('span')
      .attr('class', 'tile-unit')
      .text('gb');
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

    return this;
  }
}
