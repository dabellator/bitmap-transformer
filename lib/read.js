var fs = require('fs');

// create object with bitmap data properties and write function

var Bitmap = function(buffer) {

  this.buffer = buffer;
  this.header = buffer.slice(0, 54);
  this.type = buffer.toString('utf-8', 0, 2);
  this.firstPixel = buffer.readUInt32LE(10);
  this.hasPalette = (this.firstPixel !== 54) ? true : false;
  this.colorPalette = buffer.slice(54, this.firstPixel);
  this.pixelData = buffer.slice(this.firstPixel);
  this.applyFilter = function(transition, channel) {
    
    // sort of useless use of .call here, I was hoping to achieve something else
    // feels awkward, is there are better way to do this?
    return transition.call(this, channel);
  };
  this.write = function(filename) {
    
    var output = [this.header, this.colorPalette];
    if (this.pixelData) output.push(this.pixelData); 
    fs.writeFile(filename, Buffer.concat(output));
  };

};

  function readFile(fileName) {
  
  var buffer = fs.readFileSync(fileName);
  return new Bitmap(buffer);
};

module.exports = readFile;

