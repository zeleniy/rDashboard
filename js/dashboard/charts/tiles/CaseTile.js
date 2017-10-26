class CaseTile extends Tile {


  getCountPercent() {

    return '&nbsp;';
  }


  getSizePercent() {

    return '&nbsp;';
  }


  getCountTitle() {

    return 'Total';
  }


  getCountValue() {

    return _(this._dashboard.getData()).map(d => d['CaseID']).uniq().value().length;
  }


  getDataKey() {

    return 'DataSourceSize';
  }
}
