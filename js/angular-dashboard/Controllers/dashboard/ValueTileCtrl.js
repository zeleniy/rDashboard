dashboardApp.controller('ValueTileCtrl', function($scope, dataProvider) {


  $scope.sizeValue = 0;
  $scope.sizeUnit = '';
  $scope.sizePercent = 0;
  $scope.countValue = 0;
  $scope.countPercent = 0;


  $scope.init = function(config) {

    $scope.config = new Config(config);
  }


  /**
   * Update event handler.
   */
  $scope.$on('update', function() {

    $scope.data = dataProvider.getData();

    $scope.sizeValue = Math.round($scope.getSizeValue());
    $scope.sizeUnit = $scope.getUnit();
    $scope.sizePercent = $scope.getSizePercent();
    $scope.countValue = Math.round($scope.getCountValue());
    $scope.countPercent = $scope.getCountPercent();
  });


  $scope.isDisabled = function() {

    return $scope.accessor != undefined && $scope.accessor != $scope.config.get('accessor');
  }


  /**
   * 
   */
  $scope.getTotalSize = function() {

    return d3.sum($scope.data, function(d) {
      return d['DataSourceSize'];
    });
  };


  /**
   * 
   */
  $scope.getSizeValue = function() {

    var sizeKey = $scope.getDataKey($scope.config.get('accessor'), 'Size');
    return d3.sum($scope.data, function(d) {
      return d[sizeKey];
    });
  };


  /**
   * 
   */
  $scope.getCountValue = function() {

    var sizeKey = $scope.getDataKey($scope.config.get('accessor'), 'Count');
    return d3.sum($scope.data, function(d) {
      return d[sizeKey];
    });
  };


  /**
   * 
   */
  $scope.getCountPercent = function() {

    return Math.round($scope.getCountValue() / $scope.getTotalCount() * 100);
  };


  /**
   * 
   */
  $scope.getSizePercent = function() {

    return Math.round($scope.getSizeValue() / $scope.getTotalSize() * 100);
  };


  /**
   * 
   */
  $scope.getTotalCount = function() {

    return d3.sum($scope.data, function(d) {
      return d['IdentifiedDataSourcesCount'];
    });
  };


  /**
   * 
   */
  $scope.getDataKey = function(accessor, mode) {

    return accessor + mode;
  };


  /**
   * Get unit.
   * @public
   * @returns {String}
   */
  $scope.getUnit = function() {

    var key = $scope.getDataKey($scope.config.get('accessor'), 'Size') + 'Unit';

    if ($scope.data.length == 0) {
      return '';
    }

    var unitString = _.find($scope.data, function(d) {
      return d[key];
    });

    if (unitString) {
      return unitString[key];
    }

    return '';
  };
});