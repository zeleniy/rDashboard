class SummationTip extends Tip {


  getData(accessor, value) {

    const column = this.getColumn();

    const data = _(this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData());

    var result = Math.round(data
      .filter(d => d[accessor] == value)
      .sumBy(column) * 10) / 10;

    if (this._withUnit) {
      const unitColumn = column + 'Unit';
      const unit = data.find(d => d[unitColumn])[unitColumn];
      if (unit) {
        result += ' ' + unit;
      }
    }

    if (this._calculatePercent) {
      var total = Math.round(data.sumBy(column) * 10) / 10;

      if (result == 0 || total == 0) {
        result += ' (0%)';
      } else {
        result += ' (' + Math.round(result / total * 1000) / 10 + '%)';
      }
    }

    return [this._prefix, result];
  }
}
