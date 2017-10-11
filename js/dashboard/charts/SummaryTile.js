class SummaryTile extends Widget {


  constructor(dashboard, options) {

    super(dashboard, options);
  }


  renderTo(selector) {

    super.renderTo(selector);

    const table = this._container.append('table')
      .attr('class', 'tile')
      .style('background-color', this._config.get('backgroundColor'))
      .append('tbody')
      .append('tr');

    const leftSide = table.append('td')
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

    const rightSide = table.append('td')
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
  }
}
