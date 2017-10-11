class LocalFileProvider extends DataProvider {


  constructor(filePath) {

    super();
    this._filePath = filePath;
  }


  onLoad(callback) {

    d3.tsv(this._filePath, function(error, data) {
      if (error) {
        return console.error(error);
      }

      callback();
    })
  }
}
