/**
 * Dashboard.
 * @public
 * @class
 */
function Dashboard(options) {

    this._config = new Config(options);
    this._dataProvider = new DataProvider();
    this._tooltip = new Tooltip();
    this._charts = [];
    this._mode = 'Case';

    var self = this;

    d3.selectAll('.tiles-mode-filter input')
      .on('change', function () {
          self._modeChangeEventHandler(this);
      });

    d3.selectAll('.reset-button')
      .on('click', function () {
          self.resetAllFilters();
      });

    d3.select(window).on('resize', function () {
        self.resize();
    });
}


Dashboard.prototype.getMode = function () {

    return this._mode;
};


Dashboard.prototype.getDataProvider = function () {

    return this._dataProvider;
};


Dashboard.prototype.getTooltip = function () {

    return this._tooltip;
};


/**
 * Render dashboard components.
 * @public
 * @returns {Dashboard}
 */
Dashboard.prototype.render = function () {
    /*
     * Render filters.
     */
    this._renderFilters();
    /*
     * Render charts.
     */
    this._charts.forEach(function (chart) {
        chart.render();
    });

    return this;
};


/**
 * Render filters.
 * @private
 */
Dashboard.prototype._renderFilters = function () {

    var self = this;

    var container = d3.select(this._config.get('filters.placeholder'));

    this._config.get('filters.list').forEach(function (accessor) {
        /*
         * Get filter values.
         */
        var values = _.chain(this.getData())
          .map(function (d) {
              return d[accessor];
          }).uniq()
          .value();
        /*
         * Prepend default empty value.
         */
        values.unshift('');
        /*
         * Render select with aoptions and set change handler.
         */
        container
          .append('select')
          .attr('class', 'filter')
          .datum(accessor)
          .on('change', function (d, i) {
              self._filterChangedEventHandler(this, d);
          }).selectAll('option')
          .data(values)
          .enter()
          .append('option')
          .attr('value', String)
          .text(String);
    }, this);
};


/**
 * Filter changed event handler.
 * @private
 * @param {HTMLSelectElement} select
 * @param {String} accessor
 */
Dashboard.prototype._filterChangedEventHandler = function (select, accessor) {
    /*
     * Get select value.
     */
    var value = select.value;
    /*
     * If value is empty we should remove button and reset filter.
     */
    if (value == '') {
        return this._resetFilterButton(accessor, false);
    }
    /*
     * Set dashboard new data filter.
     */
    this.setDataFilter(accessor, function (d) {
        return d == value;
    }, value);
};


/**
 * Remove filter button.
 * @private
 * @param {HTMLSelectElement} select
 * @param {String} accessor
 */
Dashboard.prototype._removeFilterButton = function (accessor) {

    d3.select('.filters-list')
      .selectAll('.filter')
      .filter(function (d) {
          return d == accessor;
      }).remove();
};


/**
 * Remove filter button.
 * @private
 * @param {String} accessor
 * @param {Boolean} resetSelect
 */
Dashboard.prototype._resetFilterButton = function (accessor, resetSelect) {

    if (_.isUndefined(resetSelect)) {
        resetSelect = true;
    }
    /*
     * Reset dashboard filter.
     */
    this.resetDataFilter(accessor);

    if (resetSelect === false) {
        return;
    }

    d3.select(this._config.get('filters.placeholder'))
      .selectAll('.filter')
      .filter(function (d) {
          return d == accessor;
      }).selectAll('option')
      .filter(function (d, i) {
          return i == 0;
      }).property('selected', 'selected');
};


/**
 * Reset data filter.
 * @public
 * @param {String} name - filter name.
 * @param {Boolean} applyCallback
 * @retuns {Dashboard}
 */
Dashboard.prototype.resetDataFilter = function (accessor, applyCallback) {

    if (_.isUndefined(applyCallback)) {
        applyCallback = true;
    }
    /*
     * Remove filter button.
     */
    this._removeFilterButton(accessor);
    /*
     * Remove filter from data provider.
     */
    this._dataProvider.resetFilter(accessor, applyCallback);

    this.update();

    return this;
};


/**
 * Reset all filters.
 * @public
 * @returns {Dashboard}
 */
Dashboard.prototype.resetAllFilters = function () {

    var self = this;

    _(this._dataProvider.getFilters()).each(function (filter, accessor) {
        self._resetFilterButton(accessor);
    });

    return this;
};


Dashboard.prototype.resize = function () {

    this._charts.forEach(function (chart) {
        chart.resize();
    });
};


Dashboard.prototype.setAccessor = function (accessor) {

    this._dataProvider.setAccessor(accessor);
    this.update();
};


Dashboard.prototype._modeChangeEventHandler = function (node) {

    this._mode = node.value[0].toUpperCase() + node.value.substring(1).toLowerCase();

    this._dataProvider.setMode(this._mode);

    this._charts.forEach(function (chart) {
        chart.setMode(this._mode);
    }, this);

    _.find(this._charts, function (chart) {
        return chart instanceof Tiles;
    }).updateFilter();

    this.update();
};


Dashboard.prototype.addChart = function (chart) {

    this._charts.push(chart.setDashboard(this));
    return this;
};


Dashboard.prototype.setData = function (data) {

    this._dataProvider.setData(data);
    return this;
};


/**
 * Set data filter.
 * @public
 * @param {String} name - filter name.
 * @param {Function} comparator - filter function.
 * @param {String} [value] - filter value.
 * @param {Function} [callback] - reset button click callback.
 * @retuns {Dashboard}
 */
Dashboard.prototype.setDataFilter = function (accessor, comparator, value, callback) {

    var self = this;
    /*
     * Remove filter button if any.
     */
    this._removeFilterButton(accessor);

    this._dataProvider.setFilter(accessor, comparator, callback);
    /*
     * Render new filter button.
     */
    var button = d3.select('.filters-list')
      .append('div')
      .datum(accessor)
      .attr('class', 'filter');
    button
      .append('span')
      .text(accessor + (value ? ' = ' + value : ''));
    button.append('span')
      .attr('class', 'filter-remove')
      .text('x')
      .on('click', function () {
          self._resetFilterButton(accessor);
      });

    this.update();
};


Dashboard.prototype.update = function () {

    this._charts.forEach(function (chart) {
        chart.update();
    });
};


Dashboard.prototype.getData = function () {

    return this._dataProvider.getData();
};

/**
 * Data provider.
 * @public
 * @class
 */
function DataProvider(data, filters, mode) {

    this._data = data || [];
    this._filters = filters || {};
    this._mode = mode || 'Case';
}


DataProvider.prototype.setMode = function (mode) {

    this._mode = mode;
};


DataProvider.prototype.getMode = function () {

    return this._mode;
};


DataProvider.prototype.getAccessor = function () {

    return this._accessor;
};


DataProvider.prototype.setData = function (data) {

    this._data = data;
};


DataProvider.prototype.setFilter = function (accessor, comparator, callback) {

    this._filters[accessor] = {
        comparator: comparator,
        callback: callback
    };
};


DataProvider.prototype.resetFilter = function (accessor, applyCallback) {

    applyCallback = _.isUndefined(applyCallback) ? true : applyCallback;

    if (applyCallback && this._filters[accessor] && this._filters[accessor].callback) {
        this._filters[accessor].callback();
    }

    delete this._filters[accessor];
};


DataProvider.prototype.getFilters = function () {

    return this._filters;
};


DataProvider.prototype.setAccessor = function (accessor) {

    this._accessor = accessor;
};


DataProvider.prototype.getData = function () {

    return this._data;
};


DataProvider.prototype._getSummaryFunction = function () {

    var topLevelAccessor;

    if (this._mode == 'Case') {
        return function (input) {
            return input.length;
        };
    } else if (this._mode == 'Count') {
        topLevelAccessor = this._accessor ? this._accessor + this._mode : 'IdentifiedDataSources' + this._mode;
        return function (input) {
            return d3.sum(input, function (d) {
                return d[topLevelAccessor];
            });
        };
    } else {
        topLevelAccessor = this._accessor ? this._accessor + this._mode : 'DataSource' + this._mode;
        if (topLevelAccessor == 'IdentifiedDataSourcesSize') {
            topLevelAccessor = 'DataSourceSize';
        }

        return function (input) {
            return Math.round(d3.sum(input, function (d) {
                return d[topLevelAccessor];
            }) * 10) / 10;
        };
    }
};


/**
 * Get filtered and grouped by accessor data.
 * @public
 * @param {String} accessor - property name to group by
 * @param {String[]} excludeList - list of filters names to exclude
 * @param {Object[]} [data] - data to group
 * @returns {Object[]}
 */
DataProvider.prototype.getGroupedData = function (accessor, excludeList, data) {

    var summary = this._getSummaryFunction();

    return _.chain(data || this.getFilteredData(excludeList))
      .groupBy(function (d) {
          return d[accessor];
      }).map(function (value, key) {
          return {
              name: key,
              value: summary(value)
          };
      }).filter(function (d) {
          return d.value > 0;
      }).value()
      .sort(function (a, b) {
          return b.value - a.value;
      });
};


/**
 * Get filtered data.
 * @public
 * @param {String[]} excludeList - list of filters names to exclude
 * @returns {Object[]}
 */
DataProvider.prototype.getFilteredData = function (excludeList) {

    if (_.size(this._filters) == 0) {
        return this._data;
    }

    if (!Array.isArray(excludeList)) {
        excludeList = [excludeList];
    }

    var data = this._data.slice(0);

    _.each(this._filters, function (filter, accessor) {

        if (excludeList.length > 0 && excludeList.indexOf(accessor) != -1) {
            return;
        }

        data = _.filter(data, function (d) {
            return filter.comparator(d[accessor]);
        });
    });

    return data;
};

function Tip(prefix, column, calculatePercent, withUnit) {

    this._prefix = prefix;
    this._column = column;
    this._calculatePercent = calculatePercent;
    this._withUnit = withUnit;
}


Tip.prototype.getColumn = function () {

    if (_.isFunction(this._column)) {
        return this._column(this._chart);
    } else {
        return this._column;
    }
};


Tip.prototype.setChart = function (chart) {

    this._chart = chart;
    return this;
};


Tip.prototype.getData = function (accessor, groupBy, value) {

    throw new Error('Method getData() not implemented on ' + this.constructor.name);
};

function TitleTip(prefix, column, calculatePercent, withUnit) {

    Tip.call(this, prefix, column, calculatePercent, withUnit);
}


TitleTip.prototype = Object.create(Tip.prototype);


TitleTip.prototype.getData = function (accessor, groupBy, d) {

    return [d[this._prefix]];
};

function SimpleTip(prefix, column, calculatePercent, withUnit) {

    Tip.call(this, prefix, column, calculatePercent, withUnit);
}


SimpleTip.prototype = Object.create(Tip.prototype);


SimpleTip.prototype.getData = function (accessor, groupBy, d) {

    return [this._prefix, d[this.getColumn()]];
};

function FrequencyTip(prefix, column, calculatePercent, withUnit) {

    Tip.call(this, prefix, column, calculatePercent, withUnit);
}


FrequencyTip.prototype = Object.create(Tip.prototype);


FrequencyTip.prototype.getData = function (accessor, groupBy) {

    var column = this.getColumn();

    var data = _.chain(this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData());

    var result = data
      .filter(function (d) {
          return d[accessor] == groupBy;
      }).map(function (d) {
          return d[column];
      }).uniq()
      .value()
      .length;

    if (this._calculatePercent) {
        var total = data
          .map(function (d) {
              return d[column];
          }).uniq()
          .value()
          .length;
        result += ' (' + Math.round(result / total * 1000) / 10 + '%)';
    }

    return [this._prefix, result];
};

function SummationTip(prefix, column, calculatePercent, withUnit) {

    Tip.call(this, prefix, column, calculatePercent, withUnit);
}


SummationTip.prototype = Object.create(Tip.prototype);


SummationTip.prototype.getData = function (accessor, groupBy) {

    var column = this.getColumn();

    var data = this._chart
      .getDashboard()
      .getDataProvider()
      .getFilteredData();

    var result = _.filter(data, function (d) {
        return d[accessor] == groupBy;
    });

    result = d3.sum(result, function (d) {
        return d[column];
    });

    result = Math.round(result * 10) / 10;

    var unit = '';
    if (this._withUnit) {
        var unitColumn = column + 'Unit';
        unit = _.find(data, function (d) {
            return d[unitColumn];
        })[unitColumn];

        if (unit) {
            unit = ' ' + unit;
        }
    }

    var percent = '';
    if (this._calculatePercent) {
        var total = Math.round(d3.sum(data, function (d) {
            return d[column];
        }) * 10) / 10;

        if (result == 0 || total == 0) {
            percent += ' (0%)';
        } else {
            percent += ' (' + Math.round(result / total * 1000) / 10 + '%)';
        }
    }

    return [this._prefix, result + unit + percent];
};

/**
 * Configuration class.
 * @public
 * @class
 * @param {Object} [config={}]
 */
function Config(options) {

    this._options = options || {};
}


/**
 * Get original options.
 * @public
 * @return {Object}
 */
Config.prototype.getOptions = function () {

    return this._options;
};


/**
 * Set option.
 * @public
 * @param {String} option
 * @param {Mixed} optionValue
 */
Config.prototype.set = function (option, optionValue) {

    var parts = option.split(".");
    var options = this._options;

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (i == parts.length - 1) {
            options[part] = optionValue;
        } else if (!(part in options)) {
            options[part] = {};
        } else {
            options = options[part];
        }
    }
};


/**
 * Get option value.
 * @public
 * @param {String} option
 * @param {Mixed} defaultValue
 * @return {Mixed}
 */
Config.prototype.get = function (option, defaultValue, params) {

    var value = this._options;
    var parts = option.split(".");

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (_.isUndefined(value[part])) {
            return defaultValue;
        } else {
            value = value[part];
        }
    }

    if (_.isFunction(value)) {
        return value.apply(undefined, params);
    } else {
        return value;
    }
};


/**
 * Check if config has option.
 * @public
 * @param {String} option
 * @return {Boolean}
 */
Config.prototype.has = function (option) {

    var value = this._options;
    var parts = option.split(".");

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (_.isUndefined(value[part])) {
            return false;
        } else {
            value = value[part];
        }
    }

    return true;
};


/**
 * Check if config option equals to value.
 * @public
 * @param {String} option
 * @param {Mixed} value
 * @return {Boolean}
 */
Config.prototype.is = function (option, value) {

    return this.get(option) == value;
};

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


Tooltip.prototype.getContainer = function () {

    return this._tip;
};


/**
 * Remove tooltip container.
 * @public
 */
Tooltip.prototype.remove = function () {

    this._tip.remove();
};


/**
 * @public
 * @param {String} content
 * @returns {Tooltip}
 */
Tooltip.prototype.setContent = function (content) {

    this._content = content;
    return this;
};


/**
 * @public
 * @param {Number[]} offset
 * @returns {Tooltip}
 */
Tooltip.prototype.setOffset = function (offset) {

    this._offset = offset;
    return this;
};


/**
 * @public
 */
Tooltip.prototype.show = function () {

    this._table
      .selectAll('tr')
      .remove();

    this._table.selectAll('tr')
      .data(this._content)
      .enter()
      .append('tr')
      .selectAll('td')
      .data(function (d) {
          return d;
      }).enter()
      .append('td')
      .attr('colspan', function (d, i, set) {
          return 2 - set.length + 1;
      }).text(String);

    this._tip
      .style('display', 'block');

    this.move();

    return this;
};


Tooltip.prototype.move = function () {

    var doc = document.documentElement;

    var xOffset = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var yOffset = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

    var box = this._tip.node().getBoundingClientRect();

    var x = d3.event.clientX + xOffset - box.width / 2;
    var y = d3.event.clientY + yOffset - box.height - 5;

    this._tip
      .style('left', x + 'px')
      .style('top', y + 'px');
};


/**
 * @public
 */
Tooltip.prototype.hide = function () {

    this._tip.style('display', 'none');
};

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
Ticks.prototype.setDistance = function (distance) {

    this._distance = distance;
    return this;
};


/**
 * @public
 */
Ticks.prototype.rarefy = function () {

    this.rarefyLabels();
    this._rarefyTicks();
};


/**
 * Get ticks values.
 * @private
 * @returns {String[]}
 */
Ticks.prototype._getTicksValues = function () {

    return this._container
      .selectAll('text')
      .nodes()
      .map(function (node) {
          return node.innerHTML;
      });
};


/**
 * @public
 */
Ticks.prototype.rarefyLabels = function () {

    var self = this;
    /*
     * Get ticks values.
     */
    var ticksValues = this._getTicksValues();
    /*
     * Compute rarefied ticks array.
     */
    for (var i = 2; this._hasOverlaps() ; i++) {

        this._tickValues = ticksValues
          .map(function (d, j) {
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
        this._container.call(this._axis.tickFormat(function (d, i) {
            return self._tickValues[i];
        }));
    }
};


Ticks.prototype._filter = function () {

};


/**
 * Check if axis tiks's labels overlaps.
 * @private
 * @returns {Boolean}
 */
Ticks.prototype._hasOverlaps = function () {

    var self = this;

    var dimensions = _.filter(this._container.selectAll('text').nodes(), function (node, i) {
        return self._tickValues[i] !== null;
    }).map(function (node) {
        return node.getBoundingClientRect();
    });

    for (var i = 1; i < dimensions.length; i++) {
        if (this._compare(dimensions[i - 1], dimensions[i])) {
            return true;
        }
    }

    return false;
};


/**
 * @private
 */
Ticks.prototype._rarefyTicks = function () {

    var self = this;

    this._container
      .selectAll('g > line')
      .style('opacity', function (d, i) {
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
Ticks.prototype._compare = function (tick1, tick2) {

    throw new Error('Method _compare() not implemented in ' + this.constructor.name);
};

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
XTicks.getInstance = function (axis, container) {

    return new XTicks(axis, container);
};


/**
 * @protected
 * @override
 * @returns {Integer}
 */
XTicks.prototype._getIndex = function () {

    return 0;
};


/**
 * @protected
 * @override
 * @param {DOMRect} tick1
 * @param {DOMRect} tick2
 * @returns {Boolean}
 */
XTicks.prototype._compare = function (tick1, tick2) {

    return tick1.right + this._distance > tick2.left;
};

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
YTicks.getInstance = function (axis, container) {

    return new YTicks(axis, container);
};


/**
 * @protected
 * @override
 * @returns {Integer}
 */
YTicks.prototype._getIndex = function () {

    return 1;
};


/**
 * @protected
 * @override
 * @param {DOMRect} tick1
 * @param {DOMRect} tick2
 * @returns {Boolean}
 */
YTicks.prototype._compare = function (tick1, tick2) {

    return tick1.top + this._distance < tick2.bottom;
};

/**
 * Widget/chart base class.
 * @public
 * @abstract
 * @class
 * @param {Object} [options={}]
 */
function Widget(options) {

    this._config = new Config(options || {});

    this._colorSet = this._config.get('colorScheme', d3.schemeCategory10);
    if (!Array.isArray(this._colorSet)) {
        this._colorSet = [this._colorSet];
    }

    this._duration = 1000;

    var self = this;
    this._tips = this._config.get('tooltip', []).map(function (tip) {
        return tip.setChart(self);
    });

    this._title = d3.select();
    this._subtitle = d3.select();

    this._margin = {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2
    };
}


Widget.prototype.getMode = function () {

    return this._mode;
};


Widget.prototype.getDashboard = function () {

    return this._dashboard;
};


Widget.prototype._getTransition = function (animate, selection) {

    if (animate) {
        return selection.transition().duration(this._duration);
    } else {
        return selection;
    }
};


Widget.prototype.getTooltip = function () {

    return this._dashboard.getTooltip();
};


Widget.prototype.getTooltipContent = function (accessor, groupBy, d) {

    return this._tips.map(function (tip) {
        return tip.getData(accessor, groupBy, d);
    });
};


Widget.prototype.getConfig = function () {

    return this._config;
};


Widget.prototype.setMode = function (mode) {

    this._mode = mode;
};


Widget.prototype.getAccessor = function () {

    return this._config.get('accessor');
};


/**
 * Get chart margin.
 * @public
 * @returns {Object}
 */
Widget.prototype.getMargin = function () {

    return this._margin;
};


/**
 * Set parent dashboard.
 * @public
 * @param {Dashboard} dashboard
 * @returns {Widget}
 */
Widget.prototype.setDashboard = function (dashboard) {

    this._dashboard = dashboard;
    return this;
};


/**
 * Get chart outer width.
 * @returns {Number}
 */
Widget.prototype.getOuterWidth = function () {

    return this._container
      .node()
      .getBoundingClientRect()
      .width;
};


/**
 * Get chart inner width.
 * @returns {Number}
 */
Widget.prototype.getInnerWidth = function () {

    var margin = this.getMargin();

    return this._container
      .node()
      .getBoundingClientRect()
      .width - margin.left - margin.right;
};


/**
 * Get chart outer height.
 * @returns {Number}
 */
Widget.prototype.getOuterHeight = function () {

    return this._container
      .node()
      .getBoundingClientRect()
      .height;
};


/**
 * Get chart inner height.
 * @returns {Number}
 */
Widget.prototype.getInnerHeight = function () {

    var margin = this.getMargin();

    return this._container
      .node()
      .getBoundingClientRect()
      .height - margin.top - margin.bottom;
};


Widget.prototype.getTitle = function () {

    return this._config.get('title', '', [this]);
};


Widget.prototype.getSubtitle = function () {

    return this._config.get('subtitle', '', [this]);
};


/**
 * Render widget.
 * @public
 * @abstract
 * @returns {Widget}
 */
Widget.prototype.render = function () {

    var container = d3.select(this._config.get('placeholder'));

    var title = this.getTitle();
    if (title != '') {
        this._title = container
          .append('div')
          .attr('class', 'chart-title')
          .style('text-align', this._config.get('titleAlign', 'center'));
    }

    var subtitle = this.getSubtitle();
    if (subtitle != '') {
        this._subtitle = container
          .append('div')
          .attr('class', 'chart-subtitle')
          .style('text-align', this._config.get('titleAlign', 'center'));
    }

    this._container = container
      .append('div')
      .attr('class', 'chart-container');

    this._colorScale = d3.scaleOrdinal()
      .domain(this.getColorDomain())
      .range(this.getColorRange());
};


/**
 * @inheritdoc
 * @override
 */
Widget.prototype.getColorKey = function () {

    return this._config.get('accessor');
};


Widget.prototype.getColorDomain = function () {

    var accessor = this.getColorKey();
    return _.chain(this._dashboard.getData())
      .map(function (d) {
          return d[accessor];
      }).uniq()
      .sort()
      .value();
};


Widget.prototype.getColorRange = function () {

    var self = this;

    return this.getColorDomain().map(function (d, i) {
        return self._colorSet[i % self._colorSet.length];
    });
};


/**
 * Update widget.
 * @public
 * @abstract
 * @param {Boolean} [animate=true]
 * @returns {Widget}
 */
Widget.prototype.update = function (animate) {

    this._title.text(this.getTitle());
    this._subtitle.text(this.getSubtitle());
};


/**
 * Update widget.
 * @public
 * @abstract
 * @param {Boolean} [animate=false]
 * @returns {Widget}
 */
Widget.prototype.resize = function (animate) {

    throw new Error('Method resize() not implemented on ' + this.constructor.name);
};


/**
 * Get data key.
 * @public
 * @returns {String}
 */
Widget.prototype.getDataKey = function () {

    return this._config.get('accessor');
};


/**
 * Get chart grouped data.
 * @public
 * @param {String[]} excludeList - list of filters to exclude
 * @returns {Mixed[]}
 */
Widget.prototype.getData = function (excludeList) {

    return this._dashboard
      .getDataProvider()
      .getGroupedData(this.getDataKey(), excludeList);
};

/**
 * Tiles manager.
 * @public
 * @class
 */
function Tiles(options) {

    Widget.call(this, options);

    this._tiles = this._config.get('tiles');
    this._clickedTile = undefined;
    this._mode = 'Count';
}


Tiles.prototype = Object.create(Widget.prototype);


Tiles.prototype.getActiveTile = function () {

    return this._clickedTile;
};


Tiles.prototype.getDataKey = function (accessor, mode) {

    mode = mode || this._mode;
    accessor = accessor || this._clickedTile.getAccessor();
    return accessor + mode[0].toUpperCase() + mode.substring(1).toLowerCase();
};


Tiles.prototype.updateFilter = function () {

    var span = d3.selectAll('.filters-list div.filter')
      .filter(function (d) {
          return d == 'ValueColumn';
      }).select('span');

    if (span.size()) {
        span.text('ValueColumn = ' + this.getDataKey());
    }
};


Tiles.prototype.toggle = function (clickedTile) {

    var isSame = this._clickedTile == clickedTile;

    if (!isSame) {
        clickedTile.highlight(!isSame);
    }

    _.filter(this._tiles, function (tile) {
        return tile != clickedTile;
    }).forEach(function (tile) {
        tile.highlight(isSame);
    });

    this._clickedTile = isSame ? undefined : clickedTile;

    this._dashboard.setAccessor(isSame ? undefined : clickedTile.getConfig().get('accessor'));
};


Tiles.prototype.update = function () {

    this._tiles.forEach(function (tile) {
        tile.update();
    });
};


Tiles.prototype.resize = function () {

};


Tiles.prototype.getColorDomain = function () {

    return d3.range(this._config.get('tiles').length);
};


Tiles.prototype.render = function () {

    Widget.prototype.render.call(this);

    var container = d3.select(this._config.get('placeholder'))
      .append('div')
      .attr('class', 'tiles')
      .node();

    this._config.get('tiles').forEach(function (tile, i) {

        var config = tile.getConfig();

        config.set('backgroundColor', this._colorScale(i));
        config.set('placeholder', container);

        tile
          .setManager(this)
          .setDashboard(this._dashboard)
          .render();
    }, this);
};

/*jshint sub:true*/


/**
 * Tile chart.
 * @public
 * @class
 */
function Tile(options) {

    Widget.call(this, options);
}


Tile.prototype = Object.create(Widget.prototype);


/**
 * Set tiles manager.
 * @public
 * @param {Tiles}
 * @returns {Tile}
 */
Tile.prototype.setManager = function (tiles) {

    this._manager = tiles;
    return this;
};


/**
 * Get data key.
 * @public
 * @param {'Count'|'Size'|'Case'} [mode]
 * @returns {String}
 */
Tile.prototype.getDataKey = function (mode) {

    return this._manager.getDataKey(this._config.get('accessor'), mode);
};


/**
 * Get unit.
 * @public
 * @returns {String}
 */
Tile.prototype.getUnit = function () {

    var key = this.getDataKey('size') + 'Unit';
    var data = this._dashboard.getData();

    if (data.length == 0) {
        return '';
    }

    var unitString = _.find(data, function (d) {
        return d[key];
    });

    if (unitString) {
        return unitString[key];
    }

    return '';
};


/**
 * Highlight tile§.
 * @public
 * @param {Boolean} select
 */
Tile.prototype.highlight = function (select) {

    var opacity = select ? 1 : 0.5;

    var bgColor = d3.color(this._config.get('backgroundColor'));
    bgColor.opacity = opacity;

    this._table
      .style('opacity', opacity)
      .style('background-color', bgColor);
};


/**
 * @inheritdoc
 */
Tile.prototype.render = function () {

    var self = this;

    this._container = d3.select(this._config.get('placeholder'));

    this._table = this._container
      .append('table')
      .attr('class', 'tile')
      .style('background-color', this._config.get('backgroundColor'))
      .on('click', function () {
          self.click();
      });
    var table = this._table
      .append('tbody')
      .append('tr');

    var leftSide = table.append('td')
      .attr('class', 'tile-right')
      .append('table')
      .append('tbody');

    var row = leftSide.append('tr');

    this._countValue = row.append('td')
      .attr('class', 'tile-value');
    var td = row.append('td')
      .attr('class', 'data-source-text')
      .text(this.getCountTitle());
    td.append('div')
      .attr('class', 'data-source')
      .text(this.getCountSubtitle());
    this._countPercent = leftSide
      .append('tr')
      .append('td')
      .attr('class', 'summary')
      .attr('colspan', 2);

    var rightSide = table.append('td')
      .attr('class', 'tile-left');

    var div = rightSide.append('div');
    this._sizeValue = div.append('span')
      .attr('class', 'tile-value');
    this._sizeUnit = div.append('span')
      .attr('class', 'tile-unit');
    this._sizePercent = rightSide.append('div')
      .attr('class', 'summary');

    return this.update();
};


/**
 * @inheritdoc
 */
Tile.prototype.update = function () {

    this._sizeValue.text(Math.round(this.getSizeValue()));
    this._sizeUnit.html(this.getUnit());
    this._sizePercent.html(this.getSizePercent());

    this._countValue.html(Math.round(this.getCountValue()));
    this._countPercent.html(this.getCountPercent());

    return this;
};


Tile.prototype.getCountSubtitle = function () {

    return this._config.get('name');
};


Tile.prototype.getSizeValue = function () {

    var sizeKey = this.getDataKey('size');
    return d3.sum(this._dashboard.getData(), function (d) {
        return d[sizeKey];
    });
};


Tile.prototype.getTotalSize = function () {

    return d3.sum(this._dashboard.getData(), function (d) {
        return d['DataSourceSize'];
    });
};

/*jshint sub:true*/


function SimpleTile(options) {

    Tile.call(this, options);
}


SimpleTile.prototype = Object.create(Tile.prototype);


SimpleTile.prototype.click = function () {

    var self = this;

    var isSame = this._manager.getActiveTile() == this;

    this._manager.toggle(this);

    if (isSame) {
        this._dashboard.resetDataFilter('ValueColumn', false);
    } else {
        this._dashboard.setDataFilter(
          'ValueColumn',
          function () {
              return true;
          },
          this.getDataKey(),
          function () {
              self._manager.toggle(self);
          }
        );
    }
};


SimpleTile.prototype.getCountValue = function () {

    var sizeKey = this.getDataKey('count');
    return d3.sum(this._dashboard.getData(), function (d) {
        return d[sizeKey];
    });
};


SimpleTile.prototype.getCountPercent = function () {

    return Math.round(this.getCountValue() / this.getTotalCount() * 100) + '% of Total';
};


SimpleTile.prototype.getSizePercent = function () {
    var sizePercent = 0.0;
    sizePercent = Math.round(this.getSizeValue() / this.getTotalSize() * 100) + '% of Total';
    return sizePercent;
};


SimpleTile.prototype.getTotalCount = function () {
    var totalCount = 0;
    totalCount = d3.sum(this._dashboard.getData(), function (d) {
        return +d['IdentifiedDataSourcesCount'];
    });
    return totalCount;
};


SimpleTile.prototype.getCountTitle = function () {

    var countTitle = this._config._options.name;

    if (countTitle === "hosted" || countTitle === "produced") return 'export set(s)';
    else return 'data source(s)';

};

/*jshint sub:true*/

/* Case Tile */
function CaseTile(options) {

    Tile.call(this, options);
}


CaseTile.prototype = Object.create(Tile.prototype);


CaseTile.prototype.click = function () {

    var isSame = this._manager.getActiveTile() == this;

    this._manager.toggle(this._manager.getActiveTile());

    this._dashboard.resetDataFilter('ValueColumn', false);
};


CaseTile.prototype.getCountPercent = function () {

    return '&nbsp;';
};


CaseTile.prototype.getSizePercent = function () {

    return '&nbsp;';
};


CaseTile.prototype.getCountTitle = function () {

    return 'Total';
};


CaseTile.prototype.getCountValue = function () {

    return _.chain(this._dashboard.getData())
      .map(function (d) {
          return d['CaseID'];
      }).uniq()
      .value()
      .length;
};


CaseTile.prototype.getDataKey = function () {

    return 'DataSourceSize';
};

function PieChart(options) {

    Widget.call(this, options);

    this._legendBoxSize = 15;
    this._legendBoxGap = 2;
    this._legendBottomOffset = 5;

    this._pie = d3.pie()
      .sort(null)
      .value(function (d) {
          return d.value;
      });
}


PieChart.prototype = Object.create(Widget.prototype);

PieChart.prototype.getData = function () {
    return {
        'name': 'barchart-data',
        'data': Widget.prototype.getData.call(this),
        'baseData': this._dashboard.getDataProvider().getFilteredData()
    };
};


PieChart.prototype.render = function () {

    Widget.prototype.render.call(this);

    this._svg = this._container
      .append('svg')
      .attr('class', 'pie-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    this._legend = this._svg
      .append('g')
      .attr('class', 'legend');

    return this.update(false);
};


PieChart.prototype.getInnerHeight = function () {

    return Widget.prototype.getInnerHeight.call(this) - this._legend.node().getBoundingClientRect().height - this._legendBottomOffset;
};


PieChart.prototype.resize = function (animate) {

    var outerWidth = this.getOuterWidth();
    var outerHeight = this.getOuterHeight();

    this._svg
      .attr('width', outerWidth)
      .attr('height', outerHeight);

    var labelMaxLength = this._legend.selectAll('text').nodes().reduce(function (maxLength, node) {
        return Math.max(maxLength, node.getBoundingClientRect().width);
    }, 0);

    var columnLength = labelMaxLength + this._legendBoxSize * 1.5 + this._legendBoxGap;
    var columnsPerRow = Math.floor(this.getOuterWidth() / columnLength);

    this._legend.selectAll('g')
      .attr('transform', function (d, i) {
          return 'translate(' + (i % columnsPerRow * columnLength) + ', ' + (Math.floor(i / columnsPerRow) * 20) + ')';
      });

    this._legend.selectAll('text')
      .attr('x', this._legendBoxSize + this._legendBoxGap);

    var box = this._legend.node().getBoundingClientRect();
    var offset = [(outerWidth - box.width) / 2, outerHeight - box.height - this._legendBottomOffset];

    this._legend
      .attr('transform', function () {
          return 'translate(' + offset + ')';
      });

    var innerWidth = this.getInnerWidth();
    var innerHeight = this.getInnerHeight();

    this._canvas
      .attr('transform', 'translate(' + [innerWidth / 2, innerHeight / 2] + ')');

    var radius = Math.min(innerWidth, innerHeight) / 2;

    var arc = d3.arc()
      .outerRadius(radius * 0.9)
      .innerRadius(0);

    if (animate) {
        this._slices
          .transition()
          .duration(this._duration)
          .attrTween('d', function (d) {
              var i = d3.interpolate(this._current, d);
              this._current = i(0);
              return function (t) {
                  return arc(i(t));
              };
          });
    } else {
        this._slices
          .attr('d', arc);
    }

    return this;
};


PieChart.prototype.update = function (animate) {

    animate = _.isUndefined(animate) ? true : false;
    Widget.prototype.update.call(this, animate);

    var self = this;

    var baseData = this.getData().baseData;
    var data = this.getData().data;

    var update = this._legend
      .selectAll('g')
      .data(data, function (d) {
          return d.name;
      });
    update.exit().remove();
    var rows = update.enter()
      .append('g');
    rows.append('rect')
      .attr('width', this._legendBoxSize)
      .attr('height', this._legendBoxSize)
      .attr('fill', function (d) {
          return self._colorScale(d.name);
      });
    rows.append('text')
      .attr('dy', '0.9em');

    var chartData = this._pie(data);

    update = this._canvas
      .selectAll('path')
      .data(chartData, function (d) {
          return d.data.name;
      });
    update.exit()
      .each(function (d) {
          this._current = _.clone(d);
          d.startAngle = d.endAngle;
      });

    var cc = clickcancel();
    update.enter()
      .append('path')
      .attr('class', 'slice clickable')
      .attr("id", function (d) { return 'Slice-' + d.data.name; })
      .attr('fill', function (d) {
          return self._colorScale(d.data.name);
      }).call(cc)
      .each(function (d) {
          this._current = d;
      });
    cc.on('click', function (d) {
        var value = d.data.name;
        self._dashboard.setDataFilter(self.getAccessor(), function (d) {
            return d == value;
        }, value);
    });
    cc.on('dblclick', function (d) {
        // Switch off the tooltip before routing to a new location
        self.getTooltip().hide();
        var caseTypeName = d.data.name;
        var caseInfo = _.find(baseData, function (b) { return (b.CaseType === caseTypeName ? b.CaseTypeID : null); });

        // Call Angular to get the controller for the dashboard page and invoke the routing function
        angular.element(document.getElementById('Slice-' + caseTypeName)).controller().navigateToCaseList(caseInfo.CaseID, caseInfo.MatterID, "CASETYPE", caseInfo.CaseTypeID, caseInfo.CaseType);
    });

    this._slices = this._canvas
      .selectAll('path')
      .on('mouseenter', function (d) {
          self.getTooltip()
            .setContent(self.getTooltipContent(self._config.get('accessor'), d.data.name, d.data))
            .show();
      })
      .on('mouseout', function (d) {
          self.getTooltip().hide();
      })
      .on('mousemove', function (d) {
          self.getTooltip().move();
      });

    var total = d3.sum(data, function (d) {
        return d.value;
    });

    this._legend
      .selectAll('text')
      .data(data)
      .text(function (d) {
          return d.name + ' ' + d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)';
      });

    return this.resize(animate);
};


PieChart.prototype._getMidAngle = function (d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
};

function BarChart(options) {

    Widget.call(this, options);

    this._gap = 5;
    this._margin = {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
    };
}

BarChart.prototype = Object.create(Widget.prototype);

BarChart.prototype.getData = function () {
    return {
        'name': 'barchart-data',
        'data': Widget.prototype.getData.call(this),
        'baseData': this._dashboard.getDataProvider().getFilteredData()
    };
};


BarChart.prototype.render = function () {

    Widget.prototype.render.call(this);

    this._svg = this._container
      .append('svg')
      .attr('class', 'bar-chart');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    return this.update(false);
};


BarChart.prototype.resize = function (animate) {

    var self = this;

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    this._canvas
      .attr('transform', 'translate(' + this._margin.left + ', ' + this._margin.top + ')');

    var data = this.getData().data;
    var index = _.chain(data)
      .sort(function (a, b) {
          return b.value - a.value;
      }).reduce(function (result, value, index) {
          result[value.name] = index; return result;
      }, {}).value();
    /*
     * Get max value.
     */
    this._xMax = d3.max(data, function (d) {
        return d.value;
    });

    this._blockHeight = this.getInnerHeight() / data.length;
    this._thickness = 15;
    /*
     * Define x scale function.
     */
    this._xScale = d3.scaleLinear()
      .range([0, this.getInnerWidth()])
      .domain([0, this._xMax]);
    /*
     * Render bars containers.
     */
    this._getTransition(animate, this._barsContainers)
      .attr('transform', function (d) {
          return 'translate(0, ' + (index[d.name] * self._blockHeight) + ')';
      });
    /**
     *
     */
    this._yOffset = this._blockHeight / 2 - this._thickness / 2;
    /*
     * Render background bars.
     */
    this._barsContainers
      .selectAll('rect.background-bar')
      .attr('transform', 'translate(0, ' + this._yOffset + ')')
      .attr('width', function () {
          return self._xScale(self._xMax);
      })
      .attr('height', this._thickness);
    /*
     * Render bars.
     */
    this._getTransition(animate, this._barsContainers
      .selectAll('rect.bar')
      .attr('transform', 'translate(0, ' + this._yOffset + ')'))
      .attr('width', function (d) {
          return self._xScale(d.value);
      })
      .attr('height', this._thickness);
    /*
     * Append labels.
     */
    this._barsContainers
      .selectAll('text.label')
      .attr('dy', this._yOffset - this._gap);
    /*
     * Append value labels.
     */
    this._barsContainers
      .selectAll('text.value')
      .attr('x', this._xScale(this._xMax))
      .attr('dy', this._yOffset - this._gap);

    return this;
};


BarChart.prototype.update = function (animate) {

    animate = _.isUndefined(animate) ? true : false;
    Widget.prototype.update.call(this);

    var self = this;

    var baseData = this.getData().baseData;
    var data = this.getData().data;
    /*
     * Render bars containers.
     */
    var update = this._canvas
      .selectAll('g.bar-container')
      .data(data, function (d) {
          return d.name;
      });
    update.exit().remove();
    var barsContainers = update
      .enter()
      .append('g')
      .attr('class', 'bar-container');
    /*
     * Render background bars.
     */
    barsContainers
      .append('rect')
      .attr('class', 'background-bar');
    /*
     * Render bars.
     */
    var cc = clickcancel();
    barsContainers
      .append('rect')
      .attr("id", function (d) { return 'Bar-' + d.name; })
      .attr('class', 'bar clickable')
      .style('fill', function (d) {
          return self._colorScale(d.name);
      })
      .call(cc);
    cc.on('click', function (d) {
        var value = d.name;
        self._dashboard.setDataFilter(self.getAccessor(), function (d) {
            return d == value;
        }, value);
    });
    cc.on('dblclick', function (d) {
        // Switch off the tooltip before routing to a new location
        self.getTooltip().hide();
        var orgName = d.name;
        var orgInfo = _.find(baseData, function (e) { return (e.OrganizationName === orgName ? e.OrganizationID : null); });

        // Call Angular to get the controller for the dashboard page and invoke the routing function
        angular.element(document.getElementById('Bar-' + d.name)).controller().navigateToCaseList(orgInfo.CaseID, orgInfo.MatterID, "ORGANIZATIONNAME", orgInfo.OrganizationID, orgInfo.OrganizationName);
    });
    /*
     * Append labels.
     */
    barsContainers
      .append('text')
      .attr('class', 'label')
      .text(function (d) {
          return d.name;
      });
    /*
     * Append value labels.
     */
    this._valueLabels = barsContainers
      .append('text')
      .attr('class', 'label value');

    this._barsContainers = this._canvas
      .selectAll('g.bar-container');

    this._barsContainers
      .selectAll('rect.bar')
      .data(data, function (d) {
          return d.name;
      }).on('mouseenter', function (d) {
          self.getTooltip()
            .setContent(self.getTooltipContent(self._config.get('accessor'), d.name, d))
            .show();
      })
      .on('mouseout', function (d) {
          self.getTooltip().hide();
      })
      .on('mousemove', function (d) {
          self.getTooltip().move();
      });

    var total = d3.sum(data, function (d) {
        return d.value;
    });

    this._barsContainers
      .selectAll('text.value')
      .data(data, function (d) {
          return d.name;
      }).text(function (d) {
          return d.value + ' (' + (Math.round(d.value / total * 1000) / 10) + '%)';
      });

    return this.resize(animate);
};

/*jshint sub:true*/


/**
 * Scatter plot.
 * @public
 * @class
 */
function ScatterPlot(options) {

    Widget.call(this, options);

    this._mode = 'Count';
    this._maxR = 15;
    this._minR = 3;
    this._padding = this._maxR * 2;

    this._margin = {
        top: this._maxR,
        right: this._maxR,
        bottom: 20,
        left: 5
    };
}


ScatterPlot.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.getMargin = function () {

    var margin = _.clone(Widget.prototype.getMargin.call(this));

    margin.left += this._yAxisContainer.node().getBoundingClientRect().width;

    return margin;
};


ScatterPlot.prototype.getData = function () {

    return this._dashboard
      .getDataProvider()
      .getFilteredData();
};


ScatterPlot.prototype.setMode = function (mode) {

    if (mode.toLowerCase() != 'case') {
        Widget.prototype.setMode.call(this, mode);
    }
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.getColorKey = function () {

    return this._config.get('colorAccessor');
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.render = function () {

    Widget.prototype.render.call(this);

    this._svg = this._container
      .append('svg')
      .attr('class', 'scatter-plot');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    this._xLabel = this._canvas
      .append('text')
      .attr('class', 'axis-label x-axis-label')
      .text(this._config.get('xLabel'));

    this._yLabel = this._canvas
      .append('text')
      .attr('class', 'axis-label y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 11);

    this._xAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._yAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._xAxisAppendix = this._canvas
      .append('line')
      .attr('class', 'axis-appendix');

    this._yAxisAppendix = this._canvas
      .append('line')
      .attr('class', 'axis-appendix');

    return this.update(false);
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.resize = function (animate) {

    var self = this;

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', this.getOuterHeight());

    var margin = this.getMargin();

    var data = this.getData();

    var x = this._config.get('xAccessor');
    var y = this._config.get('yAccessor', undefined, [this]);
    var r = this._config.get('radiusAccessor');
    var color = this._config.get('colorAccessor');

    var innerWidth = this.getInnerWidth();
    var innerHeight = this.getInnerHeight();

    var yDomain = d3.extent(data, function (d) {
        return d[y];
    });

    var yScale = d3.scaleLinear()
      .range([innerHeight, this._padding])
      .domain(yDomain);

    var yAxis = d3.axisLeft(yScale);
    this._yAxisContainer
      .attr('transform', 'translate(' + [0, -this._padding] + ')')
      .call(yAxis);

    YTicks.getInstance(yAxis, this._yAxisContainer)
      .rarefy();

    margin = this.getMargin();

    var rAccessor = this._config.get('radiusAccessor');
    var rMax = d3.max(this._dashboard.getData(), function (d) {
        return d[rAccessor];
    });

    var rScale = d3.scaleLinear()
      .range([this._minR, this._maxR])
      .domain([0, rMax]);

    var xDomain = d3.extent(data, function (d) {
        return d[x];
    });

    var xScale = d3.scaleTime()
      .range([0, this.getInnerWidth() - this._padding])
      .domain(xDomain);

    this._getTransition(animate, this._dots
      .attr('cx', function (d) {
          return xScale(d[x]) + self._padding;
      }).attr('cy', function (d) {
          return yScale(d[y]) - self._padding;
      })).attr('r', function (d) {
          return rScale(d[r]);
      });

    var xAxis = d3.axisBottom(xScale);

    this._xAxisContainer
      .attr('transform', 'translate(' + [this._padding, this.getInnerHeight()] + ')')
      .call(xAxis);

    this._yLabel
      .text(this._config.get('yLabel', undefined, [this]))
      .attr('x', -this._yLabel.node().getBoundingClientRect().height);

    this._xLabel
      .attr('x', this.getInnerWidth())
      .attr('y', this.getInnerHeight() - 2);

    XTicks.getInstance(xAxis, this._xAxisContainer)
      .rarefy();

    this._canvas
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    this._xAxisAppendix
      .attr('x1', 0)
      .attr('y1', innerHeight + 0.5)
      .attr('x2', this._padding)
      .attr('y2', innerHeight + 0.5);

    this._yAxisAppendix
      .attr('x1', 0.5)
      .attr('y1', innerHeight - this._padding)
      .attr('x2', 0.5)
      .attr('y2', innerHeight);
};


/**
 * @inheritdoc
 * @override
 */
ScatterPlot.prototype.update = function (animate) {

    animate = _.isUndefined(animate) ? true : false;
    Widget.prototype.update.call(this, animate);

    var self = this;

    var data = this.getData();

    var color = this._config.get('colorAccessor');

    var update = this._canvas
      .selectAll('circle.dot')
      .data(data, function (d) {
          return d['CaseID'];
      });

    update.exit()
      .remove();

    var cc = clickcancel();
    update.enter()
      .append('circle')
      .attr("id", function (d) { return 'Case-' + d.CaseID; })
      .attr('class', 'dot')
      .attr('fill', function (d) {
          return self._colorScale(d[color]);
      }).call(cc);
    cc.on('dblclick', function (d) {
        //Switch off the tooltip before routing to a new location
        self.getTooltip().hide();
        // Call Angular to get the controller for the dashboard page and invoke the routing function
        if (d.AccessPermission)
            angular.element(document.getElementById('Case-' + d.CaseID)).controller().navigateToCaseView(d.CaseID, d.MatterID);
    });

    this._dots = this._canvas
      .selectAll('circle.dot')
      .on('mouseenter', function (d) {
          self.getTooltip()
            .setContent(self.getTooltipContent(self._config.get('colorAccessor'), d[color], d))
            .show();
      })
      .on('mouseout', function (d) {
          self.getTooltip().hide();
      })
      .on('mousemove', function (d) {
          self.getTooltip().move();
      });

    return this.resize(animate);
};

/**
 * Tree map.
 * @public
 * @class
 */
function TreeMap(options) {

    Widget.call(this, options);
}


TreeMap.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
TreeMap.prototype.getData = function () {
    return {
        'name': 'flare',
        'children': Widget.prototype.getData.call(this),
        'baseData': this._dashboard.getDataProvider().getFilteredData()
    };
};


TreeMap.prototype.render = function () {

    Widget.prototype.render.call(this);

    this._main = this._container
      .append('div')
      .attr('class', 'treemap')
      .style('position', 'relative');

    return this.update(false);
};


TreeMap.prototype.resize = function (animate) {

    var width = this.getOuterWidth();
    var height = this.getOuterHeight();
    var margin = this.getMargin();

    var data = this.getData();

    var treemap = d3.treemap().size([width, height]);
    var root = d3.hierarchy(data, function (d) {
        return d.children;
    }).sum(function (d) {
        return d.value;
    });

    var tree = treemap(root);
    var chartData = data.children.length ? tree.leaves() : [];

    this._getTransition(animate, this._nodes
      .data(chartData))
      .style('left', function (d) {
          return d.x0 + 'px';
      }).style('top', function (d) {
          return d.y0 + 'px';
      }).style('width', function (d) {
          return Math.max(0, d.x1 - d.x0 - 1) + 'px';
      }).style('height', function (d) {
          return Math.max(0, d.y1 - d.y0 - 1) + 'px';
      });

    return this;
};


TreeMap.prototype.update = function (animate) {

    animate = _.isUndefined(animate) ? true : false;
    Widget.prototype.update.call(this, animate);

    var self = this;

    var width = this.getOuterWidth();
    var height = this.getOuterHeight();
    var margin = this.getMargin();

    var data = this.getData();
    var total = d3.sum(data.children, function (d) {
        return d.value;
    });

    var treemap = d3.treemap().size([width, height]);
    var root = d3.hierarchy(data, function (d) {
        return d.children;
    }).sum(function (d) {
        return d.value;
    });

    var tree = treemap(root);
    var chartData = data.children.length ? tree.leaves() : [];

    var update = this._main
      .datum(root)
      .selectAll('.node')
      .data(chartData, function (d) {
          return d.data.name;
      });
    update.exit().remove();

    var cc = clickcancel();
    update.enter()
      .append('div')
      .attr("id", function (d) { return 'Node-' + d.data.name; })
      .attr('class', 'node clickable')
      .style('background-color', function (d) {
          return self._colorScale(d.data.name);
      })
      .each(function (d) {
          var persent = Math.round(d.value / total * 1000) / 10;
          // if (persent > 10) {
          d3.select(this)
            .append('div')
            .attr('class', 'node-label')
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .enter()
            .append('div');
          // }
      }).call(cc);

    cc.on('click', function (d) {
        var value = d.data.name;
        self._dashboard.setDataFilter(self.getAccessor(), function (d) {
            return d == value;
        }, value);
    });
    cc.on('dblclick', function (d) {
        // Switch off the tooltip before routing to a new location
        self.getTooltip().hide();
        var matterTypeName = d.data.name;
        var matterType = _.find(data.baseData, function (d) { return (d.MatterType === matterTypeName ? d.MatterTypeID : null); });

        // Call Angular to get the controller for the dashboard page and invoke the routing function
        angular.element(document.getElementById('Node-' + d.data.name)).controller().navigateToCaseList(matterType.CaseID, matterType.MatterID, "MATTERTYPE", matterType.MatterTypeID, matterType.MatterType);
    });

    this._nodes = this._main
      .selectAll('div.node')
      .data(chartData, function (d) {
          return d.data.name;
      }).on('mouseenter', function (d) {
          self.getTooltip()
            .setContent(self.getTooltipContent(self._config.get('accessor'), d.data.name, d.data))
            .show();
      })
      .on('mouseout', function (d) {
          self.getTooltip().hide();
      })
      .on('mousemove', function (d) {
          self.getTooltip().move();
      });

    this._nodes
      .selectAll('.node-label')
      .data(chartData, function (d) {
          return d.data.name;
      }).each(function (d, i) {
          var persent = Math.round(d.value / total * 1000) / 10;
          // if (persent > 10) {
          d3.select(this)
            .selectAll('div')
            .data([d.data.name, d.data.value + ' (' + persent + '%)'])
            .text(String);
          // } else {
          //   d3.select(this)
          //     .selectAll('div')
          //     .data(['', ''])
          //     .text(String);
          // }
      });

    return this.resize(animate);
};

/**
 * Map.
 * @public
 * @class
 */
function Map(options) {

    Widget.call(this, options);
}


Map.prototype = Object.create(Widget.prototype);

Map.prototype.getData = function () {
    return {
        'name': 'barchart-data',
        'data': Widget.prototype.getData.call(this),
        'baseData': this._dashboard.getDataProvider().getFilteredData()
    };
};

/**
 * @inheritdoc
 * @override
 */
Map.prototype.render = function () {

    Widget.prototype.render.call(this);

    this._svg = this._container
      .append('svg')
      .attr('class', 'map');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    this._countryLayer = this._canvas
      .append('g')
      .attr('class', 'country-layer');

    this._dataLayer = this._canvas
      .append('g')
      .attr('class', 'data-layer');

    this._mapData = this._config.get('world');

    this._mapData.features = _.filter(this._mapData.features, function (d) {
        return d.id != 'ATA';
    });

    this._countries = this._countryLayer
      .selectAll('path')
      .data(this._mapData.features)
      .enter()
      .append('path')
      .attr('class', 'country');

    return this.update(false);
};


/**
 * @inheritdoc
 * @override
 */
Map.prototype.resize = function (animate) {

    var self = this;

    var width = this.getOuterWidth();
    var height = this.getOuterHeight();

    this._svg
      .attr('width', width)
      .attr('height', height);

    /*
     * Map scale ratio
     * d3.select('svg.map .canvas').node().getBoundingClientRect()
     * 673.7666625976562 / 436.2166748046875 = 1.5445687923308522
     */
    // var size = Math.max(width, height);
    var projection = d3.geoMercator()
      .rotate([-180, 0])
      .fitSize([width, height], this._mapData);

    // if (size > height) {
    //   this._canvas.attr('transform', 'translate(0, ' + ((height - size) / 2) + ')');
    // }

    var path = d3.geoPath().projection(projection);

    this._countries
      .attr('d', path);

    var accessor = this._config.get('accessor');
    var dataProvider = this._dashboard.getDataProvider();
    var rData = dataProvider.getGroupedData(accessor, [], dataProvider.getData().data);

    var rMax = d3.max(rData, function (d) {
        return d.value;
    });

    var rScale = d3.scaleSqrt()
      .range([3, 15])
      .domain([0, rMax]);

    var centroids = {};

    this.getData().data.forEach(function (d) {

        var centroid = path.centroid(_.find(self._mapData.features, function (country) {
            return d.name == country.properties.name;
        }));

        centroids[d.name] = {
            x: centroid[0],
            y: centroid[1]
        };
    });

    this._getTransition(animate, this._bubbles
      .attr('cx', function (d) {
          return centroids[d.name].x;
      }).attr('cy', function (d) {
          return centroids[d.name].y;
      })).attr('r', function (d) {
          return rScale(d.value);
      });

    return this;
};


/**
 * @inheritdoc
 * @override
 */
Map.prototype.update = function (animate) {

    animate = _.isUndefined(animate) ? true : false;
    Widget.prototype.update.call(this, animate);

    var self = this;

    var baseData = this.getData().baseData;
    var data = this.getData().data;

    var update = this._dataLayer
      .selectAll('circle')
      .data(data, function (d) {
          return d.name;
      });

    update
      .exit()
      .remove();

    var cc = clickcancel();
    update
      .enter()
      .append('circle')
      .attr("id", function (d) { return 'Bubble-' + d.name; })
      .attr('class', 'bubble clickable')
      .attr('fill', function (d) {
          return self._colorScale(d.name);
      })
      .call(cc);
    cc.on('click', function (d) {
        var value = d.name;
        self._dashboard.setDataFilter(self.getAccessor(), function (d) {
            return d == value;
        }, value);
    });
    cc.on('dblclick', function (d) {
        // Switch off the tooltip before routing to a new location
        self.getTooltip().hide();
        var location = d.name;
        var locationInfo = _.find(baseData, function (e) { return (e.Country === location ? e.CountryID : null); });

        // Call Angular to get the controller for the dashboard page and invoke the routing function
        angular.element(document.getElementById('Bubble-' + d.name)).controller().navigateToCaseList(locationInfo.CaseID, locationInfo.MatterID, "COUNTRY", locationInfo.CountryID, locationInfo.Country);
    });

    this._bubbles = this._dataLayer
      .selectAll('circle')
      .data(data, function (d) {
          return d.name;
      }).on('mouseenter', function (d) {
          self.getTooltip()
            .setContent(self.getTooltipContent(self._config.get('accessor'), d.name, d))
            .show();
      })
      .on('mouseout', function (d) {
          self.getTooltip().hide();
      })
      .on('mousemove', function (d) {
          self.getTooltip().move();
      });

    return this.resize(animate);
};

/**
 * Map.
 * @public
 * @class
 */
function TimeLine(options) {

    Widget.call(this, options);

    this._xScale = d3.scaleTime();

    var self = this;
    this._brush = d3.brushX()
      .on('brush', function () {
          return self._brushMoveEventHandler();
      }).on('end', function () {
          return self._brushEndEventHandler();
      });

    this._ignoreMoveEvent = true;
    this._height = 50;
    this._margin = {
        top: 0,
        right: 10,
        bottom: 20,
        left: 10
    };
}


TimeLine.prototype = Object.create(Widget.prototype);


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.render = function () {

    this._container = d3.select(this._config.get('placeholder'));

    this._svg = this._container
      .append('svg')
      .attr('class', 'time-line');

    this._canvas = this._svg
      .append('g')
      .attr('class', 'canvas');

    this._xAxisContainer = this._canvas
      .append('g')
      .attr('class', 'axis x-axis');

    this._brushContainer = this._canvas
      .append('g')
      .attr('class', 'brush');

    this._handle = this._brushContainer
      .selectAll('.custom-handle')
      .data([{ type: 'w' }, { type: 'e' }])
      .enter()
      .append('path')
      .attr('class', 'custom-handle');

    this.update();

    this.resize();

    return this;
};


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.resize = function () {

    var self = this;

    var width = this.getInnerWidth();
    var height = this._height;
    var margin = this.getMargin();

    this._svg
      .attr('width', this.getOuterWidth())
      .attr('height', height);

    this._canvas
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this._xScale
      .range([0, width]);

    var xAxis = d3.axisBottom(this._xScale);

    this._xAxisContainer
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);

    this._brush
      .extent([[0, 0], [width, height]]);

    var extent = (this._extent || this._xScale.domain()).map(this._xScale);
    this._ignoreMoveEvent = true;

    this._brushContainer
      .call(this._brush)
      .call(this._brush.move, extent);

    this._handle
      .attr('d', function (d) {
          return self._getHandlePathString(d);
      });

    XTicks.getInstance(xAxis, this._xAxisContainer)
      .rarefy();

    return this;
};


TimeLine.prototype._getHandlePathString = function (d) {

    var height = this._height;

    var e = Number(d.type == 'e');
    var x = e ? 1 : -1;
    var y = height / 2;

    return 'M' + (0.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8);
};


TimeLine.prototype._brushMoveEventHandler = function () {

    this._extent = d3.event.selection.map(this._xScale.invert);

    var height = this._height;
    var x = this._xScale;

    var s = d3.event.selection;
    if (s == null) {
        this._handle.attr('display', 'none');
    } else {
        var sx = s.map(x.invert);
        this._handle.attr('display', null).attr('transform', function (d, i) { return 'translate(' + [s[i], -height / 6] + ')'; });
    }
};


TimeLine.prototype._brushEndEventHandler = function () {

    if (this._ignoreMoveEvent === true) {
        this._ignoreMoveEvent = false; return;
    }

    var min = this._extent[0];
    var max = this._extent[1];

    var format = 'D/M/YYYY';

    this._dashboard.setDataFilter(this.getAccessor(), function (d) {
        return d >= min && d <= max;
    }, moment(min).format(format) + ' - ' + moment(max).format(format));
};


/**
 * @inheritdoc
 * @override
 */
TimeLine.prototype.update = function () {

    var accessor = this.getDataKey();
    var dataProvider = this._dashboard.getDataProvider();

    var defaultExtent = d3.extent(dataProvider.getData(), function (d) {
        return d[accessor];
    });

    var currentExtent = d3.extent(dataProvider.getFilteredData(), function (d) {
        return d[accessor];
    });

    this._xScale.domain(defaultExtent);

    var isResetRequest = defaultExtent[0] == currentExtent[0] &&
      defaultExtent[1] == currentExtent[1] &&
      this._ignoreMoveEvent == false;

    if (isResetRequest) {
        this._ignoreMoveEvent = true;

        this._brushContainer
          .call(this._brush.move, [0, this.getInnerWidth()]);
    }

    return this;
};