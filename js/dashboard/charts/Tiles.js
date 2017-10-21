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


  getDataKey(accessor, mode = this._mode) {

    return accessor + mode[0].toUpperCase() + mode.substring(1).toLowerCase();
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

    this._dashboard.setAccessor(isSame ? undefined : clickedTile.getConfig().get('accessor'));
  }


  update() {

    this._tiles.forEach(function(tile) {
      tile.update()
    });
  }


  resize() {

  }


  getColorDomain() {

    return d3.range(this._config.get('tiles').length);
  }


  render() {

    super.render();

    const container = d3.select(this._config.get('placeholder'))
      .append('div')
      .attr('class', 'tiles')
      .node();

    this._config.get('tiles').forEach(function(options, i) {

      options.backgroundColor = this._colorScale(i);
      options.placeholder = container;

      var tile = new Tile(options)
        .setManager(this)
        .setDashboard(this._dashboard)
        .onClick(this._clickHandler.bind(this))
        .render();

      this._tiles.push(tile);

    }.bind(this));
  }
}
