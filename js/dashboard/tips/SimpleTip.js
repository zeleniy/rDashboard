class SimpleTip extends Tip {


  getData(accessor, groupBy, value) {

    return [this._prefix, value];
  }
}
