dashboardApp.controller('PieChartCtrl', function($scope, $element, dataProvider, tooltip) {


  $scope._updateNumber = 0;
  $scope._chart = new PieChart($scope.pieChartConfig)
    .setTooltip(tooltip)
    .onClick(function(filter) {
      $scope.$emit('filter', filter);
    }).setDataProvider(dataProvider)
    .renderTo($element.find('div')[0]);


  /**
   * @private
   * @returns {Boolean}
   */
  $scope._useAnimation = function() {

    return Boolean($scope._updateNumber ++);
  }


  /**
   * Update event handler.
   */
  $scope.$on('update', function() {

    $scope._chart.update($scope._useAnimation());
  });
});