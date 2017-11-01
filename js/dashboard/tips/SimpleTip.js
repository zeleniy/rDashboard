function SimpleTip(prefix, column, calculatePercent, withUnit) {

  Tip.call(this, prefix, column, calculatePercent, withUnit);
}


SimpleTip.prototype = Object.create(Tip.prototype);


SimpleTip.prototype.getData = function(accessor, groupBy, d) {

  return [this._prefix, d[this.getColumn()]];
};
