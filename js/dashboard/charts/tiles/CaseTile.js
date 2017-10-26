class CaseTile extends Tile {


  click() {

    const isSame = this._manager.getActiveTile() == this;

    this._manager.toggle(this._manager.getActiveTile());

    this._dashboard.resetDataFilter('ValueColumn', false);
  }


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
