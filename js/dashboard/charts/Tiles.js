/**
 * Tiles manager.
 * @public
 * @class
 */
function Tiles(options) {

  Widget.call(this, options);

  this._tiles = this._config.get('tiles');
  this._clickedTile = undefined;
  this._mode = 'Count';
}


Tiles.prototype = Object.create(Widget.prototype);


Tiles.prototype.getActiveTile = function() {

  return this._clickedTile;
};


Tiles.prototype.getDataKey = function(accessor, mode) {

  mode = mode || this._mode;
  accessor = accessor || this._clickedTile.getAccessor();
  return accessor + mode[0].toUpperCase() + mode.substring(1).toLowerCase();
};


Tiles.prototype.updateFilter = function() {

  var span = d3.selectAll('.filters-list div.filter')
    .filter(function(d) {
      return d == 'ValueColumn';
    }).select('span');

  if (span.size()) {
    span.text('ValueColumn = ' + this.getDataKey());
  }
};


Tiles.prototype.toggle = function(clickedTile) {

  var isSame = this._clickedTile == clickedTile;

  if (! isSame) {
    clickedTile.highlight(! isSame);
  }

  _.filter(this._tiles, function(tile) {
    return tile != clickedTile;
  }).forEach(function(tile) {
    tile.highlight(isSame);
  });

  this._clickedTile = isSame ? undefined : clickedTile;

  this._dashboard.setAccessor(isSame ? undefined : clickedTile.getConfig().get('accessor'));
};


Tiles.prototype.update = function() {

  this._tiles.forEach(function(tile) {
    tile.update();
  });
};


Tiles.prototype.resize = function() {

};


Tiles.prototype.getColorDomain = function() {

  return d3.range(this._config.get('tiles').length);
};


Tiles.prototype.render = function() {

  Widget.prototype.render.call(this);

  var container = d3.select(this._config.get('placeholder'))
    .append('div')
    .attr('class', 'tiles')
    .node();

  this._config.get('tiles').forEach(function(tile, i) {

    var config = tile.getConfig();

    config.set('backgroundColor', this._colorScale(i));
    config.set('placeholder', container);

    tile
      .setManager(this)
      .setDashboard(this._dashboard)
      .render();
  }, this);
};
