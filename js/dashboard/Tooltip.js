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
    this._table = this._tip
      .append('table')
      .append('tbody');
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

    this._table
      .selectAll('tr')
      .remove();

    this._table.selectAll('tr')
      .data(this._content)
      .enter()
      .append('tr')
      .selectAll('td')
      .data(d => d)
      .enter()
      .append('td')
      .attr('colspan', function(d, i, set) {
        return 2 - set.length + 1;
      }).text(String);

    this._tip
      .style('display', 'block');

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
