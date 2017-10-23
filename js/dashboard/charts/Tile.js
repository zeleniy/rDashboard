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
   * @param {'count'|'size'} [mode]
   * @returns {String}
   */
  getDataKey(mode) {

    return this._manager.getDataKey(this._config.get('accessor'), mode);
  }


  /**
   * Get unit.
   * @public
   * @returns {String}
   */
  getUnit() {

    const key = this.getDataKey('size') + 'Unit';
    const data = this._dashboard.getData();

    if (data.length > 0) {
      return data[0][key];
    } else {
      return '';
    }
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

    this._container = d3.select(this._config.get('placeholder'));

    this._table = this._container
      .append('table')
      .attr('class', 'tile');
    const table = this._table.style('background-color', this._config.get('backgroundColor'))
      .on('click', function(d, i, selection) {
        this._clickCallback(this);
      }.bind(this))
      .append('tbody')
      .append('tr');

    const leftSide = table.append('td')
      .attr('class', 'tile-right')
      .append('table')
      .append('tbody');

    const row = leftSide.append('tr');

    this._sizeValue = row.append('td')
      .attr('class', 'tile-value');
    const td = row.append('td')
      .attr('class', 'data-source-text')
      .text('data source(s)');
    td.append('div')
      .attr('class', 'data-source')
      .text(this._config.get('name'));
    this._sizePercent = leftSide
      .append('tr')
      .append('td')
      .attr('class', 'summary')
      .attr('colspan', 2);

    const rightSide = table.append('td')
      .attr('class', 'tile-left');

    var div = rightSide.append('div')
    this._countValue = div.append('span')
      .attr('class', 'tile-value');
    this._countUnit = div.append('span')
      .attr('class', 'tile-unit');
    this._countPercent = rightSide.append('div')
      .attr('class', 'summary');


    return this.update();
  }


  /**
   * @inheritdoc
   */
  update() {

    const data = this._dashboard.getData();

    const totalCount = d3.sum(data, d => d['DataSourceCount']);
    const totalSize  = d3.sum(data, d => d['DataSourceSize']);

    const countKey = this.getDataKey('count');
    const sizeKey  = this.getDataKey('size');

    const count = d3.sum(data, d => d[countKey]);
    const size  = d3.sum(data, d => d[sizeKey]);

    this._countValue.text(Math.round(count));
    this._countUnit.text(this.getUnit());
    this._countPercent.text(Math.round(count / totalCount * 100) + '% of Total');

    this._sizeValue.text(Math.round(size));
    this._sizePercent.text(Math.round(size / totalSize * 100) + '% of Total');

    return this;
  }
}
