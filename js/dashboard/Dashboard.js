class Dashboard {


  constructor() {

    d3.selectAll('.tiles-mode-filter input')
      .on('change', this.tilesModeChangeEventHandler.bind(this));
  }


  tilesModeChangeEventHandler(d, i, set) {

    this._tiles
      .setMode(d3.select(set[i]).attr('value'))
      .update();
  }


  setTiles(tiles) {

    this._tiles = tiles;
    return this;
  }


  setData(data) {

    this._data = data;
    return this;
  }


  getData() {

    return this._data;
  }
}
