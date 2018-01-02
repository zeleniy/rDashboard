dashboardApp.controller('DashboardCtrl', function($scope, $http, dataProvider) {

  const $ctrl = this;

  $ctrl.data = [];
  $ctrl.mode = 'Case';
  $ctrl.accessor = undefined;
  $ctrl.filters = {};

  dataProvider.setMode($ctrl.mode);

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

  $ctrl.mapConfig = {
    accessor: 'Country',
//      world: world,
    title: function(chart) {
      if ($ctrl.mode == 'Case') {
        return 'Locationwise Cases Distribution';
      } else {
        return 'Locationwise Data Sources Distribution';
      }
    },
    subtitle: function(chart) {
      if ($ctrl.mode == 'Case') {
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
      if ($ctrl.mode == 'Count') {
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

  $ctrl.identifiedTileConfig = {
    name: 'identified',
    accessor: 'IdentifiedDataSources'
  }

  $ctrl.collectedTileConfig = {
    name: 'collected',
    accessor: 'CollectionDataSources'
  }

  $ctrl.processedTileConfig = {
    name: 'processed',
    accessor: 'ProcessedVolumes'
  }

  $ctrl.hostedTileConfig = {
    name: 'hosted',
    accessor: 'HostedExportsets'
  }

  $ctrl.producedTileConfig = {
    name: 'produced',
    accessor: 'ProducedDocuments'
  }

  $ctrl.timelineConfig = {
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
      $scope.$broadcast('update');
    });
  }


  $ctrl.modeChangedEventHandler = function() {

    dataProvider.setMode($ctrl.mode);
  }


  /**
   * 
   */
  $ctrl.resetAllFilters = function() {

    for (var accessor in dataProvider.getFilters()) {

      dataProvider.resetFilter(accessor);

      if (accessor == 'ValueColumn') {
        $ctrl.accessor = undefined;
        dataProvider.setAccessor(undefined);
      }
    }

    $ctrl.filters = {};
  }


  /**
   * 
   */
  $ctrl.caseTileClickedEventHandler = function() {

    if (! ('ValueColumn' in dataProvider.getFilters())) {
      return;
    }

    $ctrl.accessor = undefined;

    dataProvider
      .setAccessor(undefined)
      .resetFilter('ValueColumn');

    $ctrl.filters = _.assign({}, dataProvider.getFilters());
  }


  /**
   * @param {String} accessor
   */
  $ctrl.valueTileClickedEventHandler = function(accessor) {

    const tmpAccessor = $ctrl.accessor;
    const filters = dataProvider.getFilters();

    if ('ValueColumn' in filters) {
      $ctrl.caseTileClickedEventHandler();
    }

    if (accessor == tmpAccessor) {
      return;
    }

    dataProvider
      .setAccessor(accessor)
      .setFilter('ValueColumn', function(d) {
        return true;
      }, accessor + $ctrl.mode);

    $ctrl.accessor = accessor;
    $ctrl.filters  = _.assign({}, dataProvider.getFilters());
  }


  /**
   * @param {String} accessor
   */
  $ctrl.filterClickedEventHandler = function(accessor) {

    if (accessor == 'ValueColumn') {
      $ctrl.caseTileClickedEventHandler();
    } else {
      dataProvider.resetFilter(accessor);
    }

    $ctrl.filters = _.assign({}, dataProvider.getFilters());
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
    $scope.$broadcast('update');
  });
});
