var fs = require('fs');

// create object with bitmap data properties and write function

var Bitmap = function(buffer) {

  this.buffer = buffer;
  this.headerSize = buffer.readUInt32LE(14) + 14;
  this.header = buffer.slice(0, this.headerSize);
  this.type = buffer.toString('utf-8', 0, 2);
  this.firstPixel = buffer.readUInt32LE(10);
  this.hasPalette = (this.firstPixel !== this.headerSize) ? true : false;
  this.colorPalette = buffer.slice(this.headerSize, this.firstPixel);
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
console.log('header size: ' + this.headerSize);
};

module.exports = Bitmap;

