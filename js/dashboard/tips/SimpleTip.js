class SimpleTip extends Tip {


  getData(accessor, groupBy, d) {

    return [this._prefix, d[this.getColumn()]];
  }
}
