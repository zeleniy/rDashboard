class SummationTip extends Tip {


  getData(accessor, groupBy) {

    const column = this.getColumn();

    const data = _(this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData());

    var result = Math.round(data
      .filter(d => d[accessor] == groupBy)
      .sumBy(column) * 10) / 10;

    var unit = '';
    if (this._withUnit) {
      const unitColumn = column + 'Unit';
      unit = data.find(d => d[unitColumn])[unitColumn];
      if (unit) {
        unit = ' ' + unit;
      }
    }

    var percent = ''
    if (this._calculatePercent) {
      var total = Math.round(data.sumBy(column) * 10) / 10;

      if (result == 0 || total == 0) {
        percent += ' (0%)';
      } else {
        percent += ' (' + Math.round(result / total * 1000) / 10 + '%)';
      }
    }

    return [this._prefix, result + unit + percent];
  }
}
