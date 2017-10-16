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


  resize() {

  }


  render() {

    this._config.get('tiles').forEach(function(options, i) {

      options.backgroundColor = this.getColor({}, i);
      options.placeholder = this._config.get('placeholder');

      var tile = new Tile(options)
        .setManager(this)
        .setDashboard(this._dashboard)
        .onClick(this._clickHandler.bind(this))
        .render();

      this._tiles.push(tile);

    }.bind(this));
  }
}
