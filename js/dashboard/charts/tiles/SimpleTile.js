class SimpleTile extends Tile {


  click() {

    const isSame = this._manager.getActiveTile() == this;

    this._manager.toggle(this);

    if (isSame) {
      this._dashboard.resetDataFilter('ValueColumn', false);
    } else {
      this._dashboard.setDataFilter(
        'ValueColumn',
        () => true,
        this.getDataKey(),
        this._manager.toggle.bind(this._manager, this)
      );
    }
  }


  getCountValue() {

    const sizeKey = this.getDataKey('count');
    return d3.sum(this._dashboard.getData(), d => d[sizeKey]);
  }


  getCountPercent() {

    return Math.round(this.getCountValue() / this.getTotalCount() * 100) + '% of Total'
  }


  getSizePercent() {

    return Math.round(this.getSizeValue() / this.getTotalSize() * 100) + '% of Total';
  }


  getTotalCount() {

    return d3.sum(this._dashboard.getData(), d => d['IdentifiedDataSourcesCount']);
  }


  getCountTitle() {

    return 'data source(s)';
  }
}
