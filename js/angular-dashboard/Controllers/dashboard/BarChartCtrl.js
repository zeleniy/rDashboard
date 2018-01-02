dashboardApp.controller('BarChartCtrl', function($scope, $element, dataProvider, tooltip) {


  $ctrl = this;


  $ctrl._updateNumber = 0;
  $ctrl._chart = new BarChart($scope.barChartConfig)
    .setTooltip(tooltip)
    .onClick(this.onClick)
    .setDataProvider(dataProvider)
    .renderTo($element.find('div')[0]);


  /**
   * @private
   * @returns {Boolean}
   */
  $ctrl._useAnimation = function() {

    return Boolean($ctrl._updateNumber ++);
  }


  /**
   * Update event handler.
   */
  $scope.$on('update', function() {

    $ctrl._chart.update($ctrl._useAnimation());
  })
});