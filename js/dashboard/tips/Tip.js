function Tip(prefix, column, calculatePercent, withUnit) {

  this._prefix = prefix;
  this._column = column;
  this._calculatePercent = calculatePercent;
  this._withUnit = withUnit;
}


Tip.prototype.getColumn = function() {

  if (_.isFunction(this._column)) {
    return this._column(this._chart);
  } else {
    return this._column;
  }
}


Tip.prototype.setChart = function(chart) {

  this._chart = chart;
  return this;
}


Tip.prototype.getData = function(accessor, groupBy, value) {

  throw new Error('Method getData() not implemented on ' + this.constructor.name);
}
