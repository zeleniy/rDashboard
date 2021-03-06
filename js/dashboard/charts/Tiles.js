/**
 * Tiles manager.
 * @public
 * @class
 */
class Tiles extends Widget {


  constructor(options) {

    super(options);

    this._tiles = this._config.get('tiles');
    this._clickedTile;
    this._mode = 'Count';
  }


  getActiveTile() {

    return this._clickedTile;
  }


  getDataKey(accessor, mode = this._mode) {

    accessor = accessor || this._clickedTile.getAccessor();
    return accessor + mode[0].toUpperCase() + mode.substring(1).toLowerCase();
  }


  updateFilter() {

    const span = d3.selectAll('.filters-list div.filter')
      .filter(d => d == 'ValueColumn')
      .select('span');

    if (span.size()) {
      span.text('ValueColumn = ' + this.getDataKey())
    }
  }


  toggle(clickedTile) {

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

    this._config.get('tiles').forEach(function(tile, i) {

      const config = tile.getConfig();

      config.set('backgroundColor', this._colorScale(i));
      config.set('placeholder', container);

      tile
        .setManager(this)
        .setDashboard(this._dashboard)
        .render();

    }.bind(this));
  }
}
