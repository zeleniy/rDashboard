class Tip {


  constructor(prefix, column, calculatePercent = false, withUnit = false) {

    this._prefix = prefix;
    this._column = column;
    this._calculatePercent = calculatePercent;
    this._withUnit = withUnit;
  }


  getColumn() {

    if (_.isFunction(this._column)) {
      return this._column(this._chart);
    } else {
      return this._column;
    }
  }


  setChart(chart) {

    this._chart = chart;
    return this;
  }


  getData(accessor, value) {

    throw new Error('Method getData() not implemented on ' + this.constructor.name);
  }
}
