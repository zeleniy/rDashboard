/**
 * Tile chart.
 * @public
 * @class
 */
class Tile extends Widget {


  /**
   * @inheritdoc
   */
  constructor(options) {

    super(options);
  }


  /**
   * Set tiles manager.
   * @public
   * @param {Tiles}
   * @returns {Tile}
   */
  setManager(tiles) {

    this._manager = tiles;
    return this;
  }


  /**
   * Get data key.
   * @public
   * @returns {String}
   */
  getDataKey() {

    return this._manager.getDataKey(this._config.get('accessor'));
  }


  /**
   * Get unit.
   * @public
   * @returns {String}
   */
  getUnit() {

    const key = this.getDataKey() + 'Unit';
    return this._dashboard.getData()[0][key];
  }


  /**
   * Highlight tile§.
   * @public
   * @param {Boolean} select
   */
  highlight(select) {

    const opacity = select ? 1 : 0.5;

    var bgColor = d3.color(this._config.get('backgroundColor'));
    bgColor.opacity = opacity;

    this._table
      .style('opacity', opacity)
      .style('background-color', bgColor);
  }


  /**
   * @inheritdoc
   */
  render() {

    const self = this;

    this._container = d3.select(this._config.get('placeholder'));

    this._table = this._container
      .append('table')
      .attr('class', 'tile')
      .append('tbody')
      .append('tr')
      .style('background-color', this._config.get('backgroundColor'))
      .on('click', function(d, i, selection) {
        self._clickCallback(self, this);
      });

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

    return this.update();
  }


  /**
   * @inheritdoc
   */
  update() {

    this._valueText.text(Math.round(d3.sum(this.getData())));
    this._unitText.text(this.getUnit());

    return this;
  }
}
