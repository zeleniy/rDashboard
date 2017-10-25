const tiles = new Tiles({
  placeholder: '#tiles-placeholder',
  colorScheme: '#76acd4',
  tiles: [{
    name: 'identified',
    accessor: 'IdetifiedDataSources'
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
  }]
});

const pieChart = new PieChart({
  accessor: 'CaseType',
  placeholder: '#case-by-type-placeholder',
  title: 'Case Type Distribution',
  colorScheme: colorbrewer['Set2'][8],
  tooltip: [
    new FrequencyTip('Matters:', 'MatterID'),
    new FrequencyTip('Cases:', 'CaseID'),
    new SummationTip('Custodians:', 'ActiveCustodianCount'),
    new SummationTip('Data Sources:', 'IdetifiedDataSourcesCount'),
    new SummationTip('Data Volume:', 'IdetifiedDataSourcesSize')
  ]
});

const barChart = new BarChart({
  accessor: 'EntityName',
  placeholder: '#cases-by-entity-placeholder',
  title: 'Entity-wise distribution',
  titleAlign: 'left',
  colorScheme: colorbrewer['Dark2'][8],
  tooltip: [
    new FrequencyTip('Matters:', 'MatterID'),
    new FrequencyTip('Cases:', 'CaseID'),
    new SummationTip('Custodians:', 'ActiveCustodianCount'),
    new SummationTip('Data Sources:', 'IdetifiedDataSourcesCount'),
    new SummationTip('Total Size:', 'IdetifiedDataSourcesSize')
  ]
});

const scatterPlot = new ScatterPlot({
  xAccessor: 'CaseCreatedOn',
  yAccessor: 'DataSourceCount',
  radiusAccessor: 'DataSource',
  colorAccessor: 'MatterType',
  xLabel: 'Case Created Dates',
  yLabel: 'Data Source Count',
  placeholder: '#case-volume-placeholder',
  title: 'Case Population',
  subtitle: 'Cases vs Data Sources plotted on Case Created Date',
  tooltip: [
    new SummationTip('Custodians:', 'ActiveCustodianCount'),
    new SummationTip('Data Source Count:', function(chart) {
      return chart.getDashboard().getDataKey();
    }),
    new SummationTip('Total Size:', function(chart) {
      return chart.getDashboard().getDataKey();
    })
  ]
});

const treeMap = new TreeMap({
  accessor: 'MatterType',
  placeholder: '#matter-type-placeholder',
  title: 'Matter Type Distribution',
  tooltip: [
    new FrequencyTip('Matters:', 'MatterID'),
    new FrequencyTip('Cases:', 'CaseID'),
    new SummationTip('Custodians:', 'ActiveCustodianCount'),
    new SummationTip('Data Sources:', 'IdetifiedDataSourcesCount'),
    new SummationTip('Data Volume:', 'IdetifiedDataSourcesSize')
  ]
});

const map = new Map({
  accessor: 'Country',
  placeholder: '#map-placeholder',
  title: 'Location-wise Distribution',
  subtitle: 'Geographic distribution of',
  tooltip: [
    new FrequencyTip('Matters:', 'MatterID'),
    new FrequencyTip('Cases:', 'CaseID'),
    new SummationTip('Custodians:', 'ActiveCustodianCount'),
    new SummationTip('Data Sources:', 'IdetifiedDataSourcesCount'),
    new SummationTip('Data Volume:', 'IdetifiedDataSourcesSize')
  ]
});

const timeLine = new TimeLine({
  accessor: 'CaseCreatedOn',
  placeholder: '#timeline-placeholder'
});

DataLoader.getInstance('data/CaseStatsSummary.tsv').onLoad(function(data) {

  new Dashboard({
      filters: {
        placeholder: '#filters-placeholder',
        list: ['EntityName', 'MatterType']
      }
    }).setData(data)
    .addChart(tiles)
    .addChart(pieChart)
    .addChart(barChart)
    .addChart(scatterPlot)
    .addChart(treeMap)
    .addChart(map)
    .addChart(timeLine)
    .render();
});
