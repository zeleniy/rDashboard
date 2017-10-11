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
  }


  add(tile) {

    this._tiles.push(tile);
    return this;
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


  renderTo(selector) {

    super.renderTo(selector);

    this._tiles.forEach(function(tile) {
      tile
        .onClick(this._clickHandler.bind(this))
        .renderTo(selector);
    }.bind(this));
  }
}
