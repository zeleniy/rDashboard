dashboardApp.component('map', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<',
    filters: '<',
    onClick: '&'
  },
  template: '<div class="chart"></div>',
  controller: function($element, dataProvider, tooltip) {


    this._updateNumber = 0;


    /**
     * @private
     * @returns {Boolean}
     */
    this._useAnimation = function() {

      return Boolean(this.data.length) && Boolean(this._updateNumber ++);
    }


    /**
     * 
     */
    this.$onChanges = function(changesObj) {
      /*
       * Initialize and render chart.
       */
      if (! this._chart && 'config' in changesObj) {

        this._chart = new Map(this.config)
          .setTooltip(tooltip)
          .onClick(this.onClick)
          .setDataProvider(dataProvider)
          .renderTo($element.find('div')[0]);

        this._config = this._chart.getConfig()
      }

      this._chart.update(this._useAnimation());
    }
  }
});