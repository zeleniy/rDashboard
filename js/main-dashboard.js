const tiles = new Tiles({
  placeholder: '#tiles-placeholder',
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
  title: 'case types',
  subtitle: 'some subtitle'
});

const barChart = new BarChart({
  accessor: 'EntityName',
  placeholder: '#cases-by-entity-placeholder',
  title: 'entity names',
  subtitle: 'some subtitle'
});

const scatterPlot = new ScatterPlot({
  xAccessor: 'CaseCreatedOn',
  yAccessor: 'DataSourceCount',
  radiusAccessor: 'DataSource',
  colorAccessor: 'MatterType',
  xLabel: 'Case Created Dates',
  yLabel: 'Data Source Count',
  placeholder: '#case-volume-placeholder',
  title: 'case names',
  subtitle: 'some subtitle'
});

const treeMap = new TreeMap({
  accessor: 'MatterType',
  placeholder: '#matter-type-placeholder',
  subtitle: 'some subtitle'
});

const map = new Map({
  accessor: 'Country',
  placeholder: '#map-placeholder',
  title: 'World map',
  subtitle: 'some subtitle'
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
