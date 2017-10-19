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

const treeMap = new TreeMap({
  accessor: 'MatterType',
  placeholder: '#matter-type-placeholder'
});

const map = new Map({
  accessor: 'Country',
  placeholder: '#map-placeholder'
});

const timeLine = new TimeLine({
  accessor: 'CaseCreatedOn',
  placeholder: '#timeline-placeholder'
});

new LocalFileProvider('data/CaseStatsSummary.tsv').onLoad(function(data) {

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
