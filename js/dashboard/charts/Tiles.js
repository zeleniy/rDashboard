/**
 * Tiles manager.
 * @public
 * @class
 */
class Tiles extends Widget {


  constructor(options) {

    super(options);

    this._tiles = [];
    this._clickedTile;
    this._mode = 'count';
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

    this._config.getOptions().forEach(function(options, i) {

      options.backgroundColor = d3.schemeCategory10[i];

      var tile = new Tile(options)
        .setManager(this)
        .setDashboard(this._dashboard)
        .onClick(this._clickHandler.bind(this))
        .renderTo(selector);

      this._tiles.push(tile);

    }.bind(this));
  }
}
