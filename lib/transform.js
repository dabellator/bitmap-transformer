function transform(channel) {
  
  var palette = this.colorPalette;
  var channelDepth = 4;
  var i;
  var z;
  var d;

  if (!this.hasPalette) palette = this.pixelData, channelDepth = 3;
  var diffBuf = new Buffer(palette.length);

  switch(channel) {
    case 'red':
      channel = 2;
      break;
    case 'green':
      channel = 1;
      break;
    case 'blue':
      channel = 0;
      break;
    default:
      channel = 3;
  }

  for(i=0;i<palette.length;i=i+channelDepth) {
    for(z=0;z<channelDepth;z++) {
      d = z === channel ? 255 - palette[i+z] : palette[i+z];
      diffBuf[i+z] = d;
    }
  }
 return this.hasPalette ? this.colorPalette = diffBuf : this.pixelData = diffBuf;
}

module.exports = {
  transform: transform
};

