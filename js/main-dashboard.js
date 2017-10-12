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

  dashboard.setData(data);

  const tiles = new Tiles(dashboard);

  tilesConfig.forEach(function(options, i) {
    options.backgroundColor = d3.schemeCategory10[i];
    tiles.add(new Tile(dashboard, options))
  });

  tiles.renderTo('#tiles-placeholder');
});
