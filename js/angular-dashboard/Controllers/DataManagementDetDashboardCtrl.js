'use strict';

angular.module('app.dashboard').controller('DataManagementDetDashboardCtrl',
    function ($scope,$rootScope, $http, $state, commonHelperService, loggingService) {
        try{
            var vm = this;            
            $rootScope.$emit('hideOrShowSubMenu', Models.tabNames.dashboard);
            vm.loginInfo = JSON.parse(sessionStorage.getItem("loginInfo"));
            if (vm.loginInfo === undefined || vm.loginInfo === null) {
                $state.go(Models.stateRouteNames.login);
            }            
        }
        catch (error) {
            loggingService.exception(error);
        }
    });