function TitleTip(prefix, column, calculatePercent, withUnit) {

  Tip.call(this, prefix, column, calculatePercent, withUnit);
}


TitleTip.prototype = Object.create(Tip.prototype);


TitleTip.prototype.getData = function(accessor, groupBy, d) {

  return [d[this._prefix]];
};
