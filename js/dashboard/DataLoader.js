class DataLoader {


  constructor(filePath) {

    this._filePath = filePath;
  }


  static getInstance(filePath) {

    return new DataLoader(filePath);
  }


  onLoad(callback) {

    d3.tsv(this._filePath, function(error, data) {
      if (error) {
        return console.error(error);
      }

      callback(data);
    })
  }
}
