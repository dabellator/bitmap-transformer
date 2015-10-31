function transform(palette, channel) {

  var diffPalette = [];
  var diffBuf = new Buffer(palette.length);
  var i;
  var z;
  var d;
  
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

  for(i=0;i<palette.length;i=i+4) {
    for(z=0;z<4;z++) {
      d = z === channel ? 255 - palette[i+z] : palette[i+z];
      diffBuf[i+z] = d;
    }
  }

  return diffBuf;
};

module.exports = {
  transform: transform
};

