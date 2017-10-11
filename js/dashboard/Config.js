/**
 * Configuration class.
 * @public
 * @class
 */
class Config {
    /**
     * @public
     * @constructor
     * @param {Object} [config={}]
     */
    constructor(options = {}) {

        this._options = options;
    }


    /**
     * Get original options.
     * @public
     * @return {Object}
     */
    getOptions() {

        return this._options;
    };


    /**
     * Set option.
     * @public
     * @param {String} option
     * @param {Mixed} optionValue
     */
    set(option, optionValue) {

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
    get(option, defaultValue) {

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

        return value;
    }


    /**
     * Check if config has option.
     * @public
     * @param {String} option
     * @return {Boolean}
     */
    has(option) {

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
    is(option, value) {

        return this.get(option) == value;
    }
}
