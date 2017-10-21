class SizeDataProvider extends DataProvider {


  getFilteredData(accessor, excludeList = []) {

    return super.filter(accessor, excludeList);
  }


  getKey() {

    return this._accessor ? this._accessor + 'Size' : 'DataSourceSize';
  }
}
