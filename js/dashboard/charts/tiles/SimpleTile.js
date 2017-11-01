/*jshint sub:true*/


function SimpleTile(options) {

  Tile.call(this, options);
}


SimpleTile.prototype = Object.create(Tile.prototype);


SimpleTile.prototype.click = function() {

  var self = this;

  var isSame = this._manager.getActiveTile() == this;

  this._manager.toggle(this);

  if (isSame) {
    this._dashboard.resetDataFilter('ValueColumn', false);
  } else {
    this._dashboard.setDataFilter(
      'ValueColumn',
      function() {
        return true;
      },
      this.getDataKey(),
      function() {
        self._manager.toggle(self);
      }
    );
  }
};


SimpleTile.prototype.getCountValue = function() {

  var sizeKey = this.getDataKey('count');
  return d3.sum(this._dashboard.getData(), function(d) {
    return d[sizeKey];
  });
};


SimpleTile.prototype.getCountPercent = function() {

  return Math.round(this.getCountValue() / this.getTotalCount() * 100) + '% of Total';
};


SimpleTile.prototype.getSizePercent = function() {

  return Math.round(this.getSizeValue() / this.getTotalSize() * 100) + '% of Total';
};


SimpleTile.prototype.getTotalCount = function() {

  return d3.sum(this._dashboard.getData(), function(d) {
    return d['IdentifiedDataSourcesCount'];
  });
};


SimpleTile.prototype.getCountTitle = function() {

  return 'data source(s)';
};
