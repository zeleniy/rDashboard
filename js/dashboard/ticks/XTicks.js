/**
 * @public
 * @class
 */
class XTicks extends Ticks {
  /**
   * @public
   * @constructor
   * @param {d3.axis} axis
   * @param {d3.selection} container
   */
  constructor(axis, container) {

    super(axis, container);
    this._distance = 10;
  }


  /**
   * @public
   * @static
   * @param {d3.axis} axis
   * @param {d3.selection} container
   * @returns {Ticks}
   */
  static getInstance(axis, container) {

    return new XTicks(axis, container);
  }


  /**
   * @protected
   * @override
   * @returns {Integer}
   */
  _getIndex() {

    return 0;
  }


  /**
   * @protected
   * @override
   * @param {DOMRect} tick1
   * @param {DOMRect} tick2
   * @returns {Boolean}
   */
  _compare(tick1, tick2) {

    return tick1.right + this._distance > tick2.left;
  }
}
