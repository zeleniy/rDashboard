dashboardApp.component('simpleTile', {
  bindings: {
    config: '<',
    data: '<',
    currentAccessor: '<',
    onClick: '&'
  },
  templateUrl: 'js/angular-dashboard/Components/simple-tile/simple-tile.html',
  controller: function() {


    /**
     * 
     */
    this.$onChanges = function(changesObj) {
      /*
       * Initialize tile.
       */
      if ('config' in changesObj) {
        this._config = new Config(this.config);
        this.name = this._config.get('name');
        this.accessor = this._config.get('accessor');
      }
      /*
       * Calculate tile stats.
       */
      if ('data' in changesObj) {
        this.sizeValue = Math.round(this.getSizeValue());
        this.sizeUnit = this.getUnit();
        this.sizePercent = this.getSizePercent();
        this.countValue = Math.round(this.getCountValue());
        this.countPercent = this.getCountPercent();
      }
    }


    this.isDisabled = function() {

      return this.currentAccessor != undefined && this.currentAccessor != this.accessor;
    }


    /**
     * 
     */
    this.getTotalSize = function() {

      return d3.sum(this.data, function(d) {
        return d['DataSourceSize'];
      });
    };


    /**
     * 
     */
    this.getSizeValue = function() {

      var sizeKey = this.getDataKey(this._config.get('accessor'), 'Size');
      return d3.sum(this.data, function(d) {
        return d[sizeKey];
      });
    };


    /**
     * 
     */
    this.getCountValue = function() {

      var sizeKey = this.getDataKey(this._config.get('accessor'), 'Count');
      return d3.sum(this.data, function(d) {
        return d[sizeKey];
      });
    };


    /**
     * 
     */
    this.getCountPercent = function() {

      return Math.round(this.getCountValue() / this.getTotalCount() * 100);
    };


    /**
     * 
     */
    this.getSizePercent = function() {

      return Math.round(this.getSizeValue() / this.getTotalSize() * 100);
    };


    /**
     * 
     */
    this.getTotalCount = function() {

      return d3.sum(this.data, function(d) {
        return d['IdentifiedDataSourcesCount'];
      });
    };


    /**
     * 
     */
    this.getDataKey = function(accessor, mode) {

      return accessor + mode;
    };


    /**
     * Get unit.
     * @public
     * @returns {String}
     */
    this.getUnit = function() {

      var key = this.getDataKey(this._config.get('accessor'), 'Size') + 'Unit';

      if (this.data.length == 0) {
        return '';
      }

      var unitString = _.find(this.data, function(d) {
        return d[key];
      });

      if (unitString) {
        return unitString[key];
      }

      return '';
    };


    this.clickEventHandler = function() {

      console.log('$ctrl.clickEventHandler', this._config.get('accessor'))
    }
  }
});