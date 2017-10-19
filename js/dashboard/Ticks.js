/**
 * @private
 * @abstract
 * @class
 */
class Ticks {
  /**
   * @public
   * @constructor
   * @param {d3.axis} axis
   * @param {d3.selection} container
   */
  constructor(axis, container) {

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
  setDistance(distance) {

    this._distance = distance;
    return this;
  }


  /**
   * @public
   */
  rarefy() {

    this.rarefyLabels();
    this._rarefyTicks();
  }


  /**
   * Get ticks values.
   * @private
   * @returns {String[]}
   */
  _getTicksValues() {

    return this._container
      .selectAll('text')
      .nodes()
      .map(d => d.innerHTML);
  }


  /**
   * @public
   */
  rarefyLabels() {
    /*
     * Get ticks values.
     */
    const ticksValues = this._getTicksValues();
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
      this._container.call(this._axis.tickFormat((d, i) => this._tickValues[i]));
    }
  }


  /**
   * Check if axis tiks's labels overlaps.
   * @private
   * @returns {Boolean}
   */
  _hasOverlaps() {

    var dimensions = this._container
      .selectAll('text')
      .nodes()
      .filter((node, i) => this._tickValues[i] !== null)
      .map((node) => node.getBoundingClientRect());

    for (var i = 1; i < dimensions.length; i ++) {
      if (this._compare(dimensions[i - 1], dimensions[i])) {
        return true;
      }
    }

    return false;
  }


  /**
   * @private
   */
  _rarefyTicks() {

    this._container
      .selectAll('g > line')
      .style('opacity', (d, i) => this._tickValues[i] === null ? 0.2 : 1)
  }


  /**
   * @protected
   * @abstract
   * @param {DOMRect} tick1
   * @param {DOMRect} tick2
   * @returns {Boolean}
   */
  _compare(tick1, tick2) {

    throw new Error('Method _compare() not implemented in ' + this.constructor.name);
  }
}
