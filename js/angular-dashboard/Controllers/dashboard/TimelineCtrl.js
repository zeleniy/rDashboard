dashboardApp.controller('TimelineCtrl', function($scope, $element, dataProvider, tooltip) {


  $scope._updateNumber = 0;
  $scope._chart = new TimeLine($scope.timelineConfig)
    .setTooltip(tooltip)
    .onChange(function(filter) {
      $scope.$emit('filter', filter);
    })
    .setDataProvider(dataProvider)
    .renderTo($element.find('div')[0]);


  /**
   * @private
   * @returns {Boolean}
   */
  $scope._useAnimation = function() {

    return Boolean($scope._updateNumber ++);
  };


  /**
   * Update event handler.
   */
  $scope.$on('update', function() {

    $scope._chart.update($scope._useAnimation());
  });
});