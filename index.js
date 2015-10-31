var Reader = require('./read');
var modifier = require('./transform');

var test = new Reader('palette-bitmap.bmp');
console.log('original: ' + test.colorPalette[0], test.colorPalette[1], test.colorPalette[2], test.colorPalette[3]);
test.applyFilter(modifier.transform, 'green');
console.log(test.colorPalette);
// console.log('changed: ' + changed[0], changed[1], changed[2], changed[3]);
// test.colorPalette = changed;
test.write('another2.bmp');

