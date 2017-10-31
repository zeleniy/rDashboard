/**
 * Tile chart.
 * @public
 * @class
 */
function Tile(options) {

  Widget.call(this, options);
}


Tile.prototype = Object.create(Widget.prototype);


/**
 * Set tiles manager.
 * @public
 * @param {Tiles}
 * @returns {Tile}
 */
Tile.prototype.setManager = function(tiles) {

  this._manager = tiles;
  return this;
}


/**
 * Get data key.
 * @public
 * @param {'Count'|'Size'|'Case'} [mode]
 * @returns {String}
 */
Tile.prototype.getDataKey = function(mode) {

  return this._manager.getDataKey(this._config.get('accessor'), mode);
}


/**
 * Get unit.
 * @public
 * @returns {String}
 */
Tile.prototype.getUnit = function() {

  var key = this.getDataKey('size') + 'Unit';
  var data = this._dashboard.getData();

  if (data.length == 0) {
    return '';
  }

  var unitString = data.find(function(d) {
    return d[key];
  });

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
Tile.prototype.highlight = function(select) {

  var opacity = select ? 1 : 0.5;

  var bgColor = d3.color(this._config.get('backgroundColor'));
  bgColor.opacity = opacity;

  this._table
    .style('opacity', opacity)
    .style('background-color', bgColor);
}


/**
 * @inheritdoc
 */
Tile.prototype.render = function() {

  var self = this;

  this._container = d3.select(this._config.get('placeholder'));

  this._table = this._container
    .append('table')
    .attr('class', 'tile')
    .style('background-color', this._config.get('backgroundColor'))
    .on('click', function() {
      self.click();
    });
  var table = this._table
    .append('tbody')
    .append('tr');

  var leftSide = table.append('td')
    .attr('class', 'tile-right')
    .append('table')
    .append('tbody');

  var row = leftSide.append('tr');

  this._countValue = row.append('td')
    .attr('class', 'tile-value');
  var td = row.append('td')
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

  var rightSide = table.append('td')
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
Tile.prototype.update = function() {

  this._sizeValue.text(Math.round(this.getSizeValue()));
  this._sizeUnit.html(this.getUnit());
  this._sizePercent.html(this.getSizePercent());

  this._countValue.html(Math.round(this.getCountValue()));
  this._countPercent.html(this.getCountPercent());

  return this;
}


Tile.prototype.getCountSubtitle = function() {

  return this._config.get('name');
}


Tile.prototype.getSizeValue = function() {

  var sizeKey = this.getDataKey('size');
  return d3.sum(this._dashboard.getData(), function(d) {
    return d[sizeKey];
  });
}


Tile.prototype.getTotalSize = function() {

  return d3.sum(this._dashboard.getData(), function(d) {
    return d['DataSourceSize'];
  });
}
