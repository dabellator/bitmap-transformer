var fs = require('fs');

// create object with bitmap data properties and write function

var Bitmap = function(buffer) {

  this.header = buffer.slice(0, 54);
  this.type = buffer.toString('utf-8', 0, 2);
  this.firstPixel = buffer.readUInt32LE(10);
  this.colorPalette = buffer.slice(54, this.firstPixel);
  this.pixelData = buffer.slice(this.firstPixel);
  this.applyFilter = function(transition, type) {
    
    this.colorPalette = transition(this.colorPalette, type);
    return this.colorPalette;
  };
  this.write = function(filename) {
     
    fs.writeFile(filename, Buffer.concat(
      [this.header, this.colorPalette, this.pixelData]
    ));
  };
};

function readFile(fileName) {
  
  var buffer = fs.readFileSync(fileName);
  return new Bitmap(buffer);
};

module.exports = readFile;

