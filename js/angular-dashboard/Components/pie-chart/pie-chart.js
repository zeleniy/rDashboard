dashboardApp.component('pieChart', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<'
  },
  template: '<div class="chart"></div>',
  controller: function($element, dataProvider) {


    /**
     * 
     */
    this.$onChanges = function(changesObj) {
      /*
       * Render chart.
       */
      if (! this._chart && 'config' in changesObj) {

        this._chart = new PieChart(this.config)
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
          .update();
      }
    }
  }
});