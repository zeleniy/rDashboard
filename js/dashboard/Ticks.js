/**
 * @private
 * @abstract
 * @class
 * @param {d3.axis} axis
 * @param {d3.selection} container
 */
function Ticks(axis, container) {

  this._axis = axis;
  this._container = container;
  this._tickValues = this._getTicksValues();
}


/**
 * Set distance between ticks.
 * @public
 * @param {Number} distance
 * @returns {Ticks}
 */
Ticks.prototype.setDistance = function(distance) {

  this._distance = distance;
  return this;
};


/**
 * @public
 */
Ticks.prototype.rarefy = function() {

  this.rarefyLabels();
  this._rarefyTicks();
};


/**
 * Get ticks values.
 * @private
 * @returns {String[]}
 */
Ticks.prototype._getTicksValues = function() {

  return this._container
    .selectAll('text')
    .nodes()
    .map(function(node) {
      return node.innerHTML;
    });
};


/**
 * @public
 */
Ticks.prototype.rarefyLabels = function() {

  var self = this;
  /*
   * Get ticks values.
   */
  var ticksValues = this._getTicksValues();
  /*
   * Compute rarefied ticks array.
   */
  for (var i = 2; this._hasOverlaps(); i ++) {

    this._tickValues = ticksValues
      .map(function(d, j) {
        if (j % i == 0) {
            return d;
        } else {
            return null;
        }
      });
  }
  /*
   * Apply rarefied ticks array if overlaps were found.
   */
  if (i > 2) {
    this._container.call(this._axis.tickFormat(function(d, i) {
      return self._tickValues[i];
    }));
  }
};


Ticks.prototype._filter = function() {

};


/**
 * Check if axis tiks's labels overlaps.
 * @private
 * @returns {Boolean}
 */
Ticks.prototype._hasOverlaps = function() {

  var self = this;

  var dimensions = _.filter(this._container.selectAll('text').nodes(), function(node, i) {
      return self._tickValues[i] !== null;
    }).map(function(node) {
      return node.getBoundingClientRect();
    });

  for (var i = 1; i < dimensions.length; i ++) {
    if (this._compare(dimensions[i - 1], dimensions[i])) {
      return true;
    }
  }

  return false;
};


/**
 * @private
 */
Ticks.prototype._rarefyTicks = function() {

  var self = this;

  this._container
    .selectAll('g > line')
    .style('opacity', function(d, i) {
      return self._tickValues[i] === null ? 0.2 : 1;
    });
};


/**
 * @protected
 * @abstract
 * @param {DOMRect} tick1
 * @param {DOMRect} tick2
 * @returns {Boolean}
 */
Ticks.prototype._compare = function(tick1, tick2) {

  throw new Error('Method _compare() not implemented in ' + this.constructor.name);
};
