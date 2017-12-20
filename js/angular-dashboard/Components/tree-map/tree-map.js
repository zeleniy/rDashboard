dashboardApp.component('treeMap', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<'
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
       * Render chart.
       */
      if (! this._chart && 'config' in changesObj) {

        this._chart = new TreeMap(this.config)
          .setTooltip(tooltip)
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

        this._chart
          .setData(data, this.data)
          .setDataProvider(dataProvider)
          .update(this._useAnimation());
      }
    }
  }
});