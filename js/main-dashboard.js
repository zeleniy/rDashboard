const dashboard = new Dashboard();
const dataProvider = new LocalFileProvider('data/CaseStatsSummary.tsv');

const tilesConfig = [{
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
  }];

dataProvider.onLoad(function(data) {

  const tiles = new Tiles(tilesConfig);

  const pieChart = new PieChart({
    accessor: 'CaseType'
  });

  const barChart = new BarChart({
    accessor: 'EntityName'
  });

  dashboard
    .setData(data)
    .addChart(tiles)
    .addChart(pieChart)
    .addChart(barChart);

  tiles.renderTo('#tiles-placeholder');
  pieChart.renderTo('#case-by-type-placeholder');
  barChart.renderTo('#cases-by-entity-placeholder');
});
