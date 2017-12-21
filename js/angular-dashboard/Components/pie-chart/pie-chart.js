dashboardApp.component('pieChart', {
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
      if (this._chart && ('data' in changesObj || 'mode' in changesObj || 'filters' in changesObj)) {

        dataProvider
          .setMode(this.mode)
          .setData(this.data);

        this.filters.forEach(function(f) {
          dataProvider.setFilter(f.accessor, function(d) {
            return d == f.value;
          });
        })

        this._chart
          .setDataProvider(dataProvider)
          .update(this._useAnimation());
      }
    }


    this.clickEventHandler = function(value) {

      console.log(value);

//    var value = d.data.name;
      dataProvider.setFilter(this._config.get('accessor'), function(d) {
        return d == value;
      }, value);

    }
  }
});