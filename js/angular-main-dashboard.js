/*jshint sub:true*/

var dashboardApp = angular
  .module('dashboardApp', [])
  .factory('dataProvider', function () {
    return new DataProvider();
  })
  .factory('tooltip', function () {
    return new Tooltip();
  });