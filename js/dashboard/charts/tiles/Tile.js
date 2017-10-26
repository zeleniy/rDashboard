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
   * @param {'Count'|'Size'|'Case'} [mode]
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

    if (data.length == 0) {
      return '';
    }

    const unitString = data.find(d => d[key]);
    if (unitString) {
      return unitString[key];
    }

    return '';
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

    this._countValue = row.append('td')
      .attr('class', 'tile-value');
    const td = row.append('td')
      .attr('class', 'data-source-text')
      .text(this.getCountTitle());
    td.append('div')
      .attr('class', 'data-source')
      .text(this.getCountSubtitle());
    this._countPercent = leftSide
      .append('tr')
      .append('td')
      .attr('class', 'summary')
      .attr('colspan', 2);

    const rightSide = table.append('td')
      .attr('class', 'tile-left');

    var div = rightSide.append('div')
    this._sizeValue = div.append('span')
      .attr('class', 'tile-value');
    this._sizeUnit = div.append('span')
      .attr('class', 'tile-unit');
    this._sizePercent = rightSide.append('div')
      .attr('class', 'summary');


    return this.update();
  }


  /**
   * @inheritdoc
   */
  update() {

    this._sizeValue.text(Math.round(this.getSizeValue()));
    this._sizeUnit.html(this.getUnit());
    this._sizePercent.html(this.getSizePercent());

    this._countValue.html(Math.round(this.getCountValue()));
    this._countPercent.html(this.getCountPercent());

    return this;
  }


  getCountSubtitle() {

    return this._config.get('name');
  }


  getSizeValue() {

    const sizeKey = this.getDataKey('size');
    return d3.sum(this._dashboard.getData(), d => d[sizeKey]);
  }


  getTotalSize() {

    return d3.sum(this._dashboard.getData(), d => d['DataSourceSize']);
  }
}
