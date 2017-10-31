/**
 * @public
 * @class
 */
function Tooltip() {

  this._tip = d3.select('body')
    .append('div')
    .attr('class', 'dashboard-tooltip')
    .style('display', 'none');
  this._table = this._tip
    .append('table')
    .append('tbody');
}


Tooltip.prototype.getContainer = function() {

  return this._tip;
}


/**
 * Remove tooltip container.
 * @public
 */
Tooltip.prototype.remove = function() {

  this._tip.remove();
}


/**
 * @public
 * @param {String} content
 * @returns {Tooltip}
 */
Tooltip.prototype.setContent = function(content) {

  this._content = content;
  return this;
}


/**
 * @public
 * @param {Number[]} offset
 * @returns {Tooltip}
 */
Tooltip.prototype.setOffset = function(offset) {

  this._offset = offset;
  return this;
}


/**
 * @public
 */
Tooltip.prototype.show = function() {

  this._table
    .selectAll('tr')
    .remove();

  this._table.selectAll('tr')
    .data(this._content)
    .enter()
    .append('tr')
    .selectAll('td')
    .data(function(d) {
      return d;
    }).enter()
    .append('td')
    .attr('colspan', function(d, i, set) {
      return 2 - set.length + 1;
    }).text(String);

  this._tip
    .style('display', 'block');

  this.move();

  return this;
}


Tooltip.prototype.move = function() {

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
Tooltip.prototype.hide = function() {

    this._tip.style('display', 'none');
}
