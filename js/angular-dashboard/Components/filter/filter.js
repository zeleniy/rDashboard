dashboardApp.component('filter', {
  bindings: {
    accessor: '<',
    value: '<',
    mode: '<',
    onClick: '&'
  },
  controllerAs: '$ctrl',
  templateUrl: 'js/angular-dashboard/Components/filter/filter.html',
  controller: function() {


    /**
     * @returns {String}
     */
    this.getValue = function() {

      if (this.accessor == 'ValueColumn') {
        return this.value.replace(/(Case|Count|Size)$/, this.mode);
      } else {
        return this.value;
      }
    }
  }
});