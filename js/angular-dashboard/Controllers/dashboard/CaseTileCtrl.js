/*jshint sub:true*/


dashboardApp.controller('CaseTileCtrl', function($scope, dataProvider) {


  $scope.sizeValue = 0;
  $scope.sizeUnit = '';
  $scope.countValue = 0;


  /**
   * 
   */
  $scope.$on('update', function() {

    $scope.data = dataProvider.getData();
    $scope.config = new Config($scope.caseTileConfig);

    $scope.sizeValue = Math.round($scope.getSizeValue());
    $scope.sizeUnit = $scope.getUnit();
    $scope.countValue = Math.round($scope.getCountValue());
  });


  $scope.isDisabled = function() {

    return $scope.accessor != undefined;
  };


  /**
   * Get unit.
   * @public
   * @returns {String}
   */
  $scope.getUnit = function() {

    var key = $scope.getDataKey() + 'Unit';

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


  $scope.getSizeValue = function() {

    var sizeKey = $scope.getDataKey();
    return d3.sum($scope.data, function(d) {
      return d[sizeKey];
    });
  };


  $scope.getCountValue = function() {

    return _.chain($scope.data)
      .map(function(d) {
        return d['CaseID'];
      }).uniq()
      .value()
      .length;
  };


  $scope.getDataKey = function() {

    return 'DataSourceSize';
  };
});