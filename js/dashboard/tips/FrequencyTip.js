function FrequencyTip(prefix, column, calculatePercent, withUnit) {

  Tip.call(this, prefix, column, calculatePercent, withUnit);
}


FrequencyTip.prototype = Object.create(Tip.prototype);


FrequencyTip.prototype.getData = function(accessor, groupBy) {

  var column = this.getColumn();

  var data = _.chain(this._dataProvider.getFilteredData());

  var result = data
    .filter(function(d) {
      return d[accessor] == groupBy;
    }).map(function(d) {
      return d[column];
    }).uniq()
    .value()
    .length;

  if (this._calculatePercent) {
    var total = data
      .map(function(d) {
        return d[column];
      }).uniq()
      .value()
      .length;
    result += ' (' + Math.round(result / total * 1000) / 10 + '%)';
  }

  return [this._prefix, result];
};
