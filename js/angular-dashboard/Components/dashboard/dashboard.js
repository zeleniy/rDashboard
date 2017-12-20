dashboardApp.component('dashboard', {
  templateUrl: 'js/angular-dashboard/Components/dashboard/dashboard.html',
  controllerAs: '$ctrl',
  controller: function($timeout, $http) {


    const $ctrl = this;


    $ctrl.data = [];
    $ctrl.mode = 'case';

    $ctrl.pieChartConfig = {
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

    $ctrl.barChartConfig = {
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

    $ctrl.treeMapConfig = {
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
    }


    /**
     *
     */
    $ctrl.$onInit = function() {

      $http.get('data/CaseStatsSummary.tsv').then(function(response) {

        const data = d3.tsvParseRows(response.data);

        const keys = data[0];
        const values = data.slice(1);

        $ctrl.data = values
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
      });
    }
  }
});
