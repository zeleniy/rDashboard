class FrequencyTip extends Tip {


  getData(accessor, value) {

    const column = this.getColumn();

    const data = _(this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData());

    var result = data
      .filter(d => d[accessor] == value)
      .map(d => d[column])
      .uniq()
      .value()
      .length;

    if (this._calculatePercent) {
      var total = data
        .map(d => d[column])
        .uniq()
        .value()
        .length;
      result += ' (' + Math.round(result / total * 1000) / 10 + '%)';
    }

    return [this._prefix, result];
  }
}
