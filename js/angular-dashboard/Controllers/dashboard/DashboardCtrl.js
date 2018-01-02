dashboardApp.controller('DashboardCtrl', function($scope, $http, dataProvider) {

  const $ctrl = this;

  $ctrl.data = [];
  $scope.mode = 'Case';
  $scope.accessor = undefined;
  $scope.filters = {};

  dataProvider.setMode($scope.mode);

  $scope.pieChartConfig = {
    accessor: 'CaseType',
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
  };

  $scope.barChartConfig = {
    accessor: 'EntityName',
    title: 'Entity-wise distribution',
    titleAlign: 'left',
    colorScheme: colorbrewer['Dark2'][8],
    tooltip: [
      new TitleTip('name'),
      new FrequencyTip('Matters:', 'MatterID'),
      new FrequencyTip('Cases:', 'CaseID'),
      new SummationTip('Custodians:', 'ActiveCustodianCount'),
      new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
      new SummationTip('Total Size:', 'DataSourceSize')
    ]
   };

  $scope.treeMapConfig = {
    accessor: 'MatterType',
    title: 'Matter Type Distribution',
    tooltip: [
      new TitleTip('name'),
      new FrequencyTip('Matters:', 'MatterID', true),
      new FrequencyTip('Cases:', 'CaseID', true),
      new SummationTip('Custodians:', 'ActiveCustodianCount'),
      new SummationTip('Data Sources:', 'IdentifiedDataSourcesCount'),
      new SummationTip('Data Volume:', 'DataSourceSize', true, true)
    ]
  }

  $scope.mapConfig = {
    accessor: 'Country',
//      world: world,
    title: function(chart) {
      if ($scope.mode == 'Case') {
        return 'Locationwise Cases Distribution';
      } else {
        return 'Locationwise Data Sources Distribution';
      }
    },
    subtitle: function(chart) {
      if ($scope.mode == 'Case') {
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
  }

  $scope.scatterPlotConfig = {
    xAccessor: 'CaseCreatedOn',
    yAccessor: 'DataSourceCount',
    yScale: 'scaleLinear', // scaleLog, scaleLinear
    radiusAccessor: 'DataSourceSize',
    colorAccessor: 'MatterType',
    xLabel: 'Case Created Dates',
    yLabel: 'Data Source Count',
    title: 'Case Population',
    subtitle: function() {
      if ($scope.mode == 'Count') {
        return 'Cases vs Data Sources plotted on Case Created Date (Bubble size represents Data Sources Count)';
      } else {
        return 'Cases vs Data Sources plotted on Case Created Date (Bubble size represents Data Sources Size)';
      }
    },
    tooltip: [
      new TitleTip('CaseName'),
      new SummationTip('Custodians:', 'ActiveCustodianCount'),
      new SimpleTip('Data Source Count:', 'DataSourceCount'),
      new SimpleTip('Total Size:', 'DataSourceSize')
    ]
  }

  $ctrl.caseTileConfig = {
    name: 'caces',
    accessor: 'CaseID'
  }

  $scope.tiles = [{
    name: 'identified',
    accessor: 'IdentifiedDataSources'
  }, {
    name: 'collected',
    accessor: 'CollectionDataSources'
  }, {
    name: 'processed',
    accessor: 'ProcessedVolumes'
  }, {
    name: 'hosted',
    accessor: 'HostedExportsets'
  }, {
    name: 'produced',
    accessor: 'ProducedDocuments'
  }];

  $scope.timelineConfig = {
    accessor: 'CaseCreatedOn'
  }


  /**
   *
   */
  $ctrl.$onInit = function() {

    $http.get('data/CaseStatsSummary.tsv').then(function(response) {

      var data = d3.tsvParseRows(response.data);

      const keys = data[0];
      const values = data.slice(1);

      data = values
        .map(function(d, i) {
          return keys.reduce(function(row, key, j) {
            row[key] = values[i][j]
            return row;
          }, {});
        }).map(function(d) {

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

      dataProvider.setData(data);

      d3.json('data/world_countries.json', function(error, world) {

        $scope.mapConfig.world = world;
        $scope.$broadcast('update');
        $scope.$apply();
      })
    });
  }


  $scope.modeChangedEventHandler = function() {

    dataProvider.setMode($scope.mode);
    $scope.$broadcast('update');
  }


  /**
   * Reset all filters button click event handler.
   */
  $scope.resetAllFilters = function() {

    for (var accessor in dataProvider.getFilters()) {

      dataProvider.resetFilter(accessor);

      if (accessor == 'ValueColumn') {
        $scope.accessor = undefined;
        dataProvider.setAccessor(undefined);
      }
    }

    $scope.filters = {};
    $scope.$broadcast('update');
  }


  /**
   * 
   */
  $scope.caseTileClickedEventHandler = function() {

    if (! ('ValueColumn' in dataProvider.getFilters())) {
      return;
    }

    $scope.accessor = undefined;

    dataProvider
      .setAccessor(undefined)
      .resetFilter('ValueColumn');

    $scope.filters = dataProvider.getFilters();
  }


  /**
   * @param {String} accessor
   */
  $ctrl.valueTileClickedEventHandler = function(accessor) {
console.log('$ctrl.valueTileClickedEventHandler', accessor)
    const tmpAccessor = $scope.accessor;
    const filters = dataProvider.getFilters();

    if ('ValueColumn' in filters) {
      $scope.caseTileClickedEventHandler();
    }

    if (accessor == tmpAccessor) {
      return;
    }

    dataProvider
      .setAccessor(accessor)
      .setFilter('ValueColumn', function(d) {
        return true;
      }, accessor + $scope.mode);

    $scope.accessor = accessor;
    $scope.filters  = dataProvider.getFilters();
    $scope.$broadcast('update');
  }


  /**
   * @param {String} accessor
   */
  $scope.filterClickedEventHandler = function(accessor) {

    if (accessor == 'ValueColumn') {
      $scope.caseTileClickedEventHandler();
    } else {
      dataProvider.resetFilter(accessor);
    }

    $scope.filters = dataProvider.getFilters();
    $scope.$broadcast('update');
  }


  /**
   * Chart clicked event handler.
   */
  $scope.$on('filter', function(event, params) {

    const value = params.value;
    const accessor = params.accessor;
    const comparator = params.comparator || function(d) {
      return d == value;
    };

    dataProvider.setFilter(accessor, comparator, value);
    $scope.filters = dataProvider.getFilters();

    $scope.$apply();
    $scope.$broadcast('update');
  });
});
