const dashboard = new Dashboard();
const dataProvider = new LocalFileProvider('data/CaseStatsSummary.tsv');

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
  placeholder: '#case-by-type-placeholder'
});

const barChart = new BarChart({
  accessor: 'EntityName',
  placeholder: '#cases-by-entity-placeholder'
});

const scatterPlot = new ScatterPlot({
  accessor: 'CaseName',
  placeholder: '#case-volume-placeholder'
});


dataProvider.onLoad(function(data) {

  dashboard
    .setData(data)
    .addChart(tiles)
    .addChart(pieChart)
    .addChart(barChart)
    .addChart(scatterPlot)
    .render();
});
