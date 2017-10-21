class CountDataProvider extends DataProvider {


  getFilteredData(accessor, excludeList = []) {

    const data = _(this.getData()).groupBy(function(d) {
      return d[accessor];
    }).transform(function(result, value, key) {
      result.push({
        name: key,
        value: Math.round(d3.sum(value, d => d['DataSourceCount']))
      });
    }, [])
    .value();

    return data;
  }
}
