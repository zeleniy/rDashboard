'use strict';

angular.module('app.dashboard', [
    'ui.router',
    'ngResource'
]).config(function ($stateProvider) {
    $stateProvider.state('app.dashboard', {
        abstract: true,
        data: {
            title: 'Dashboard'
        }
    }).state('app.dashboard.maindashboard', {
        url: '/maindashboard',
        views: {
            'content@app': {
                controller: 'MainDashboardCtrl as vm',
                templateUrl: 'app/modules/Dashboard/Views/MainDashboard.html'
            }
        },
        data: {
            title: 'Main DashBoard'
        }
    }).state('app.dashboard.datamanagement', {
        url: '/datamanagementdashboard',
        views: {
            'content@app': {
                controller: 'DataManagementDetDashboardCtrl as vm',
                templateUrl: 'app/modules/Dashboard/Views/datamanagementdashboard.html'
            }
        },
        data: {
            title: 'Data Management Dashboard'
        }
    }).state('app.dashboard.processmanagement', {
        url: '/processmanagementdashboard',
        views: {
            'content@app': {
                controller: 'ProcessmanagementDashboardCtrl as vm',
                templateUrl: 'app/modules/Dashboard/Views/processmanagementdashboard.html'
            }
        },
        data: {
            title: 'Process Management Dashboard'
        }
    });
});
