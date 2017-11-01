/**
 * @public
 * @class
 * @param {d3.axis} axis
 * @param {d3.selection} container
 */
function YTicks(axis, container) {

  Ticks.call(this, axis, container);
  this._distance = 2;
}


YTicks.prototype = Object.create(Ticks.prototype);


/**
 * @public
 * @static
 * @param {d3.axis} axis
 * @param {d3.selection} container
 * @returns {Ticks}
 */
YTicks.getInstance = function(axis, container) {

  return new YTicks(axis, container);
};


/**
 * @protected
 * @override
 * @returns {Integer}
 */
YTicks.prototype._getIndex = function() {

  return 1;
};


/**
 * @protected
 * @override
 * @param {DOMRect} tick1
 * @param {DOMRect} tick2
 * @returns {Boolean}
 */
YTicks.prototype._compare = function(tick1, tick2) {

  return tick1.top + this._distance < tick2.bottom;
};
