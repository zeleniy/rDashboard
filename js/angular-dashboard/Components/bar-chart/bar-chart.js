dashboardApp.component('barChart', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<'
  },
  template: '<div class="chart"></div>',
  controller: function($element, dataProvider) {


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
       * Render chart.
       */
      if (! this._chart && 'config' in changesObj) {

        this._chart = new BarChart(this.config)
          .renderTo($element.find('div')[0]);

        this._config = this._chart.getConfig()
      }
      /*
       * Populate chart with data.
       */
      if (this._chart && ('data' in changesObj || 'mode' in changesObj)) {

        const data = dataProvider
          .setMode(this.mode)
//          .setAccessor(this._config.get('accessor'))
          .setData(this.data)
          .getGroupedData(this._config.get('accessor'), []);

        this._chart.setData(data, this.data)
          .update(this._useAnimation());
      }
    }
  }
});