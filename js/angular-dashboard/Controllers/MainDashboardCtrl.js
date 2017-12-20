'use strict';

angular.module('app.dashboard').controller('MainDashboardCtrl',
    function ($scope,$rootScope, $http, $state, webApiHelperService, commonHelperService, oDataService, paginationService, loggingService) {
        try {
            var vm = this;
            vm.dashboardUrl = null;
            vm.caseMetrics = [];
            vm.map_world = {};
            vm.tabs = Models.tabNames;
            vm.modules = Models.modules;

            vm.crudOperations = Models.crudOperations;
            vm.pagination = paginationService;
            vm.paginationObject = angular.copy(Models.paginationObject);
            vm.oDataFilterObject = angular.copy(Models.oDataPaginationFilter);
            $rootScope.$emit('hideOrShowSubMenu', Models.tabNames.dashboard);
            var refreshDataObj = {
                requestObj: null,
                oDataFilterObject: null,
                webApiMethodOperation: { getCountWebApiMethod: null, getDataWebApiMethod: null, moduleUUID: null }
            };

            vm.loginInfo = JSON.parse(sessionStorage.getItem("loginInfo"));
            if (_.isUndefined(vm.loginInfo) || _.isNull(vm.loginInfo)) {
                $state.go(Models.stateRouteNames.login);
            }

            vm.module = commonHelperService.getModuleUuid(Models.modules.dashboard);
            refreshDataObj.webApiMethodOperation.moduleUUID = vm.module.ModuleUUID;

            // Navigate to a case when double clicked on a chart element
            vm.navigateToCaseView = function (caseUUID, matterUUID) {

                $state.go(Models.stateRouteNames.caseFlow,
                {
                    caseId: caseUUID,
                    uuid: caseUUID,
                    matterId: matterUUID,
                    typeId: Models.moduleInfo.case,
                    mode: Models.modes.view,
                    matterMode: Models.modes.view,
                    tabName: vm.tabs.caseDetails,
                    module: vm.modules.cases,
                    caseTabName: vm.tabs.caseDetails
                });
            };

            vm.navigateToCaseList = function (caseId, matterId, objectType, objectId, objectName) {

                $state.go(Models.stateRouteNames.casesList,
                {
                    objectType: objectType,
                    objectId: objectId,
                    objectName: objectName
                });
            };

            // This method gets the data through web api call that's needed for rending the dashboard charts
            vm.getCaseDashboardMetrics = function (paginationObject) {
                try {
                    vm.dashboardMessage = null;

                    commonHelperService.assignModuleActions(vm.module.ModuleUUID, "", vm.module.ModuleUUID, vm.crudOperations.view);
                    var requestObj = vm.pagination.odataPagination(paginationObject);
                    var context = Models.apiCallContext(requestObj, Models.webAPIActions.getCaseMatricsSummary, true);

                    _.find(vm.oDataFilterObject, { name: Models.oDataNames.status}).value = "";
                    _.find(vm.oDataFilterObject, { name: Models.oDataNames.category}).value = "";

                    var caseMetricsPromise = webApiHelperService.get(oDataService.model(context, vm.oDataFilterObject), true);

                    caseMetricsPromise.then(function (response) {
                        if (response && response.data) {
                            vm.caseMetrics = response.data.value;

                            // Chart Render Code Goes Here
                            vm.caseMetrics.map(function (d) {

                                d['CaseCreatedOn'] = moment(d['CaseCreatedOn']).toDate();
                                d['DataSourceCount'] = Number(d['DataSourceCount']);
                                d['ActiveCustodianCount'] = Number(d['ActiveCustodianCount']);
                                d['NonActiveCustodianCount'] = Number(d['NonActiveCustodianCount']);
                                d['IdentifiedDataSourcesCount'] = Number(d['IdentifiedDataSourcesCount']);
                                d['CollectionDataSourcesCount'] = Number(d['CollectionDataSourcesCount']);
                                d['ProcessedVolumesCount'] = Number(d['ProcessedVolumesCount']);
                                d['HostedExportsetsCount'] = Number(d['HostedExportsetsCount']);
                                d['ProducedDocumentsCount'] = Number(d['ProducedDocumentsCount']);
                                d['DataSourceSize'] = Number(d['DataSourceSize']);
                                d['IdentifiedDataSourcesSize'] = Number(d['IdentifiedDataSourcesSize']);
                                d['CollectionDataSourcesSize'] = Number(d['CollectionDataSourcesSize']);
                                d['ProcessedVolumesSize'] = Number(d['ProcessedVolumesSize']);
                                d['HostedExportsetSize'] = Number(d['HostedExportsetSize']);
                                d['ProducedDocumentsSize'] = Number(d['ProducedDocumentsSize']);
                                return d;
                            });

                            $http.get('api/world_countries.json').then(function (res) {
                                vm.map_world = res.data;

                                // Configure Chart Objects
                                var tiles = new Tiles({
                                    placeholder: '#tiles-placeholder',
                                    colorScheme: '#76acd4',
                                    tiles: [new CaseTile({
                                        name: 'cases',
                                        accessor: 'CaseID'
                                    }), new SimpleTile({
                                        name: 'identified',
                                        accessor: 'IdentifiedDataSources'
                                    }), new SimpleTile({
                                        name: 'collected',
                                        accessor: 'CollectionDataSources'
                                    }), new SimpleTile({
                                        name: 'processed',
                                        accessor: 'ProcessedVolumes'
                                    }), new SimpleTile({
                                        name: 'hosted',
                                        accessor: 'HostedExportsets'
                                    }), new SimpleTile({
                                        name: 'produced',
                                        accessor: 'ProducedDocuments'
                                    })]
                                });
                                var pieChart = new PieChart({
                                    accessor: 'CaseType',
                                    placeholder: '#case-by-type-placeholder',
                                    title: 'Case Type Distribution',
                                    colorScheme: colorbrewer['Set2'][8],
                                    tooltip: [
                                        new TitleTip('name'),
                                        new FrequencyTip('Matters:', 'MatterID', true),
                                        new FrequencyTip('Cases:', 'CaseID', true),
                                        new SummationTip('Custodians:', 'ActiveCustodianCount'),
                                        new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
                                        new SummationTip('Data Volume:', 'DataSourceSize', true, true)
                                    ]
                                });
                                var barChart = new BarChart({
                                    accessor: 'OrganizationName',
                                    placeholder: '#cases-by-entity-placeholder',
                                    title: 'Organization-wise distribution',
                                    titleAlign: 'center',
                                    colorScheme: colorbrewer['Dark2'][8],
                                    tooltip: [
                                        new TitleTip('name'),
                                        new FrequencyTip('Matters:', 'MatterID', true),
                                        new FrequencyTip('Cases:', 'CaseID', true),
                                        new SummationTip('Custodians:', 'ActiveCustodianCount'),
                                        new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
                                        new SummationTip('Data Volume:', 'DataSourceSize', true, true)
                                    ]
                                });
                                var scatterPlot = new ScatterPlot({
                                    xAccessor: 'CaseCreatedOn',
                                    yAccessor: 'DataSourceCount',
                                    radiusAccessor: 'DataSourceSize',
                                    colorAccessor: 'MatterType',
                                    xLabel: 'Case Created Dates',
                                    yLabel: 'Data Source Count',
                                    placeholder: '#case-volume-placeholder',
                                    title: 'Case Population',
                                    subtitle: function (chart) {
                                        if (chart.getMode() == 'Count') {
                                            return 'Cases vs Data Sources plotted on Case Created Date (Bubble size represents Data Sources Count)';
                                        }
                                        else {
                                            return 'Cases vs Data Sources plotted on Case Created Date (Bubble size represents Data Sources Size)';
                                        }
                                    },
                                    tooltip: [
                                        new TitleTip('CaseName'),
                                        new SimpleTip('Created Date:', 'CaseCreatedOn'),
                                        new SimpleTip('Custodians:', 'ActiveCustodianCount'),
                                        new SimpleTip('Data Source Count:', 'DataSourceCount'),
                                        new SimpleTip('Data Volume:', 'DataSourceSize', false, true)
                                    ]
                                });
                                var treeMap = new TreeMap({
                                    accessor: 'MatterType',
                                    placeholder: '#matter-type-placeholder',
                                    title: 'Matter Type Distribution',
                                    tooltip: [
                                        new TitleTip('name'),
                                        new FrequencyTip('Matters:', 'MatterID', true),
                                        new FrequencyTip('Cases:', 'CaseID', true),
                                        new SummationTip('Custodians:', 'ActiveCustodianCount'),
                                        new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
                                        new SummationTip('Data Volume:', 'DataSourceSize', true, true)
                                    ]
                                });

                                var map = new Map({
                                    accessor: 'Country',
                                    placeholder: '#map-placeholder',
                                    world: vm.map_world,
                                    title: function (chart) {
                                        if (chart.getDashboard().getMode() == 'Case') {
                                            return 'Locationwise Cases Distribution';
                                        } else {
                                            return 'Locationwise Data Sources Distribution';
                                        }
                                    },
                                    subtitle: function (chart) {
                                        if (chart.getDashboard().getMode() == 'Case') {
                                            return 'Geographic distribution of cases';
                                        } else {
                                            return 'Geographic distribution of data sources';
                                        }
                                    },
                                    tooltip: [
                                      new TitleTip('name'),
                                      new FrequencyTip('Matters:', 'MatterID', true),
                                      new FrequencyTip('Cases:', 'CaseID', true),
                                      new SummationTip('Custodians:', 'ActiveCustodianCount'),
                                      new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
                                      new SummationTip('Data Volume:', 'DataSourceSize', true, true)
                                    ]
                                });

                                var timeLine = new TimeLine({
                                    accessor: 'CaseCreatedOn',
                                    placeholder: '#timeline-placeholder'
                                });

                                var dashboardConfig = {
                                    filters: {
                                        placeholder: '#filters-placeholder',
                                        list: [/*'EntityName', 'MatterType'*/]
                                    }
                                };

                                var dashboard = new Dashboard(dashboardConfig)
                                    .setData(vm.caseMetrics)
                                    .addChart(tiles)
                                    .addChart(pieChart)
                                    .addChart(barChart)
                                    .addChart(scatterPlot)
                                    .addChart(treeMap)
                                    .addChart(map)
                                    .addChart(timeLine)
                                    .render();

                                //vm.isLoading = false;
                            });
                        }

                        if (vm.caseMetrics.length === 0) {
                            vm.dashboardMessage = Models.messages.noData;
                        }
                    }, function (error) {
                        loggingService.exception(error);
                    });
                }
                catch (error) {
                    loggingService.exception(error);
                }
            };

            // Actual call to render the dashboard
            vm.getCaseDashboardMetrics(vm.paginationObject);

        }
        catch (error) {
            loggingService.exception(error);
        }
    });
