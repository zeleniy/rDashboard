dashboardApp.component('pieChart', {
  bindings: {
    config: '<',
    data: '<',
    mode: '<',
    trigger: '<',
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
       * Render chart.
       */
      if (! this._chart && 'config' in changesObj) {

        this._chart = new PieChart(this.config)
          .setTooltip(tooltip)
          .onClick(this.onClick)
          .renderTo($element.find('div')[0]);

        this._config = this._chart.getConfig()
      }
      /*
       * Populate chart with data.
       */
      dataProvider
        .setMode(this.mode)
        .setData(this.data);

      this._chart
        .setDataProvider(dataProvider)
        .update(this._useAnimation());
    }
  }
});