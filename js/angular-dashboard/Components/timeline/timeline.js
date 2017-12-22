dashboardApp.component('timeline', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<',
    filters: '<',
    onChange: '&'
  },
  template: '<div></div>',
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

        this._chart = new TimeLine(this.config)
          .setTooltip(tooltip)
          .onChange(this.onChange)
          .setDataProvider(dataProvider)
          .renderTo($element.find('div')[0]);

        this._config = this._chart.getConfig()
      }

      this._chart.update(this._useAnimation());
    }
  }
});