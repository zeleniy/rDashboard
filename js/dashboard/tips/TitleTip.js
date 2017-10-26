class TitleTip extends Tip {


  getData(accessor, groupBy, d) {

    return [d[this._prefix]];
  }
}
