/**
 * @public
 * @class
 * @param {d3.axis} axis
 * @param {d3.selection} container
 */
function XTicks(axis, container) {

  Ticks.call(this, axis, container);
  this._distance = 10;
}


XTicks.prototype = Object.create(Ticks.prototype);


/**
 * @public
 * @static
 * @param {d3.axis} axis
 * @param {d3.selection} container
 * @returns {Ticks}
 */
XTicks.getInstance = function(axis, container) {

  return new XTicks(axis, container);
}


/**
 * @protected
 * @override
 * @returns {Integer}
 */
XTicks.prototype._getIndex = function() {

  return 0;
}


/**
 * @protected
 * @override
 * @param {DOMRect} tick1
 * @param {DOMRect} tick2
 * @returns {Boolean}
 */
XTicks.prototype._compare = function(tick1, tick2) {

  return tick1.right + this._distance > tick2.left;
}
