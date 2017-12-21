dashboardApp.component('caseTile', {
  bindings: {
    config: '<',
    data: '<',
    currentAccessor: '<',
    onClick: '&'
  },
  templateUrl: 'js/angular-dashboard/Components/case-tile/case-tile.html',
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
      }
      /*
       * Calculate tile stats.
       */
      if ('data' in changesObj) {
        this.sizeValue = Math.round(this.getSizeValue());
        this.sizeUnit = this.getUnit();
        this.countValue = Math.round(this.getCountValue());
      }
    }


    this.isDisabled = function() {

      return this.currentAccessor != undefined;
    }


    /**
     * Get unit.
     * @public
     * @returns {String}
     */
    this.getUnit = function() {

      var key = this.getDataKey() + 'Unit';

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


    this.getSizeValue = function() {

      var sizeKey = this.getDataKey();
      return d3.sum(this.data, function(d) {
        return d[sizeKey];
      });
    };


    this.getCountValue = function() {

      return _.chain(this.data)
        .map(function(d) {
          return d['CaseID'];
        }).uniq()
        .value()
        .length;
    };


    this.getDataKey = function() {

      return 'DataSourceSize';
    };
  }
});