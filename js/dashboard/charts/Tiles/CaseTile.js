class CaseTile extends Tile {


  /**
   * @inheritdoc
   */
  update() {

    // For the new tile, The Count part should display the 'Total Cases' => COUNT(Unique CaseID)
    // and on the right side, Size part should display, SUM(DataSourcesSize).

    const data = this._dashboard.getData();

    const totalCount = _(data).map(d => d['CaseID']).uniq().value().length;
    const totalSize  = d3.sum(data, d => d['DataSourceSize']);

    const countKey = this.getDataKey('count');
    const sizeKey  = this.getDataKey('size');

    const count = d3.sum(data, d => d[countKey]);
    const size  = d3.sum(data, d => d[sizeKey]);

    this._sizeValue.text(Math.round(size));
    this._sizeUnit.text(this.getUnit());
    this._sizePercent.html('&nbsp;');
    // this._sizePercent.text(Math.round(size / totalSize * 100) + '% of Total');

    this._countValue.text(totalCount);
    this._countPercent.html('&nbsp;');
    // this._countPercent.text(Math.round(count / totalCount * 100) + '% of Total');

    return this;
  }
}
