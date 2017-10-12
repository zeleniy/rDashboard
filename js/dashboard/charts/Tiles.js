/**
 * Tiles manager.
 * @public
 * @class
 */
class Tiles extends Widget {


  constructor(dashboard, options) {

    super(dashboard, options);

    this._tiles = [];
    this._clickedTile;
    this._mode = 'count';
  }


  add(tile) {

    this._tiles.push(tile.setManager(this));
    return this;
  }


  setMode(mode) {

    this._mode = mode;
    return this;
  }


  getDataKey(accessor) {

    return accessor + this._mode[0].toUpperCase() + this._mode.substring(1).toLowerCase();
  }


  _clickHandler(clickedTile, element) {

    const isSame = this._clickedTile == clickedTile;

    if (! isSame) {
      clickedTile.highlight(! isSame);
    }

    this._tiles.filter(function(tile) {
      return tile != clickedTile;
    }).forEach(function(tile) {
      tile.highlight(isSame);
    });

    this._clickedTile = isSame ? undefined : clickedTile;
  }


  update() {

    this._tiles.forEach(function(tile) {
      tile.update()
    });
  }


  renderTo(selector) {

    super.renderTo(selector);

    this._tiles.forEach(function(tile) {
      tile
        .onClick(this._clickHandler.bind(this))
        .renderTo(selector);
    }.bind(this));
  }
}
