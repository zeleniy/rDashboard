class SimpleTile extends Tile {


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
