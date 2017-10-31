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
Config.prototype.getOptions = function() {

    return this._options;
};


/**
 * Set option.
 * @public
 * @param {String} option
 * @param {Mixed} optionValue
 */
Config.prototype.set = function(option, optionValue) {

  var parts = option.split(".");
  var options = this._options;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (i == parts.length - 1) {
      options[part] = optionValue;
    } else if (! (part in options)) {
      options[part] = {};
    } else {
      options = options[part];
    }
  }
}


/**
 * Get option value.
 * @public
 * @param {String} option
 * @param {Mixed} defaultValue
 * @return {Mixed}
 */
Config.prototype.get = function(option, defaultValue, params) {

  var value = this._options;
  var parts = option.split(".");

  for (var i = 0; i < parts.length; i ++) {
    var part = parts[i];
    if (value[part] === undefined) {
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
}


/**
 * Check if config has option.
 * @public
 * @param {String} option
 * @return {Boolean}
 */
Config.prototype.has = function(option) {

  var value = this._options;
  var parts = option.split(".");

  for (var i = 0; i < parts.length; i ++) {
    var part = parts[i];
    if (value[part] === undefined) {
      return false;
    } else {
      value = value[part];
    }
  }

  return true;
}


/**
 * Check if config option equals to value.
 * @public
 * @param {String} option
 * @param {Mixed} value
 * @return {Boolean}
 */
Config.prototype.is = function(option, value) {

  return this.get(option) == value;
}
