/**
 * @public
 * @class
 */
class Tooltip {


  /**
    * @public
    * @constructor
    */
  constructor() {

    this._tip = d3.select('body')
      .append('div')
      .attr('class', 'dashboard-tooltip')
      .style('display', 'none');
  }


  getContainer() {

    return this._tip;
  }


  /**
   * Remove tooltip container.
   * @public
   */
  remove() {

    this._tip.remove();
  }


  /**
   * @public
   * @param {String} content
   * @returns {Tooltip}
   */
  setContent(content) {

    this._content = content;
    return this;
  }


  /**
   * @public
   * @param {Number[]} offset
   * @returns {Tooltip}
   */
  setOffset(offset) {

    this._offset = offset;
    return this;
  }


  /**
   * @public
   */
  show() {

    this._tip.html(
      '<div>' +
        this._content +
      '</div>'
    ).style('display', 'block');

    this.move();

    return this;
  }


  move() {

    const doc = document.documentElement;

    const xOffset = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    const yOffset = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    const box = this._tip.node().getBoundingClientRect();

    const x = d3.event.clientX + xOffset - box.width / 2;
    const y = d3.event.clientY + yOffset - box.height - 5;

    this._tip
      .style('left', x + 'px')
      .style('top', y + 'px');
  }


  /**
   * @public
   */
  hide() {

      this._tip.style('display', 'none');
  }
}
