function SummationTip(prefix, column, calculatePercent, withUnit) {

  Tip.call(this, prefix, column, calculatePercent, withUnit);
}


SummationTip.prototype = Object.create(Tip.prototype);


SummationTip.prototype.getData = function(accessor, groupBy) {

  var column = this.getColumn();

  var data = this._chart
    .getDashboard()
    .getDataProvider()
    .getFilteredData();

  var result = data.filter(function(d) {
    return d[accessor] == groupBy;
  });

  result = d3.sum(result, function(d) {
    return d[column];
  });

  result = Math.round(result * 10) / 10;

  var unit = '';
  if (this._withUnit) {
    var unitColumn = column + 'Unit';
    unit = data.find(function(d) {
      return d[unitColumn];
    })[unitColumn];

    if (unit) {
      unit = ' ' + unit;
    }
  }

  var percent = '';
  if (this._calculatePercent) {
    var total = Math.round(d3.sum(data, function(d) {
      return d[column];
    }) * 10) / 10;

    if (result == 0 || total == 0) {
      percent += ' (0%)';
    } else {
      percent += ' (' + Math.round(result / total * 1000) / 10 + '%)';
    }
  }

  return [this._prefix, result + unit + percent];
};
