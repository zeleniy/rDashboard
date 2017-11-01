/*jshint sub:true*/


function CaseTile(options) {

  Tile.call(this, options);
}


CaseTile.prototype = Object.create(Tile.prototype);


CaseTile.prototype.click = function() {

  var isSame = this._manager.getActiveTile() == this;

  this._manager.toggle(this._manager.getActiveTile());

  this._dashboard.resetDataFilter('ValueColumn', false);
};


CaseTile.prototype.getCountPercent = function() {

  return '&nbsp;';
};


CaseTile.prototype.getSizePercent = function() {

  return '&nbsp;';
};


CaseTile.prototype.getCountTitle = function() {

  return 'Total';
};


CaseTile.prototype.getCountValue = function() {

  return _.chain(this._dashboard.getData())
    .map(function(d) {
      return d['CaseID'];
    }).uniq()
    .value()
    .length;
};


CaseTile.prototype.getDataKey = function() {

  return 'DataSourceSize';
};
