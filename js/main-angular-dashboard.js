/*jshint sub:true*/

var dashboardApp = angular.module('dashboardApp', []);

dashboardApp.controller('MainDashboardController', function MainDashboardController($scope) {

  var tiles = new Tiles({
    placeholder: '#tiles-placeholder',
    colorScheme: '#76acd4',
    tiles: [new CaseTile({
      name: 'caces',
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
    accessor: 'EntityName',
    placeholder: '#cases-by-entity-placeholder',
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
    subtitle: function(chart) {
      if (chart.getMode() == 'Count') {
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
    urlBase: '',
    title: function(chart) {
      if (chart.getDashboard().getMode() == 'Case') {
        return 'Locationwise Cases Distribution';
      } else {
        return 'Locationwise Data Sources Distribution';
      }
    },
    subtitle: function(chart) {
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
      list: ['EntityName', 'MatterType']
    }
  };

  d3.tsv('data/CaseStatsSummary.tsv', function(error, data) {

    if (error) {
      return console.error(error);
    }

    data.map(function(d) {

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

    var dashboard = new Dashboard(dashboardConfig)
      .setData(data)
      .addChart(tiles)
      .addChart(pieChart)
      .addChart(barChart)
      .addChart(scatterPlot)
      .addChart(treeMap)
      .addChart(map)
      .addChart(timeLine)
      .render();
  });
});
