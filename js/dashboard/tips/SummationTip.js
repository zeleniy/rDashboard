class SummationTip extends Tip {


  getData(accessor, value) {

    const column = this.getColumn();

    const data = _(this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData());

    const result = data
      .filter(d => d[accessor] == value)
      .sumBy(column);

    return [this._prefix, Math.round(result * 10) / 10];
  }
}
