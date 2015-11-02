var EE = require('events').EventEmitter;
var fs = require('fs');
var process = new EE();
var Bitmap = require('./lib/read');
var modifier = require('./lib/transform');
var bitmap = {};

process.on('open', function(file) {

  fs.readFile(__dirname + '/palette-bitmap.bmp', function(err, buf) {

    if (err) throw err;
    bitmap = new Bitmap(buf);
    process.emit('modify', 'transform', 'green');
  });
});

process.on('modify', function(filter, type) {

  bitmap.applyFilter(modifier[filter], type);
  process.emit('write', 'event.bmp');
});

process.on('write', function(name) {

  bitmap.write(name);
});

process.emit('open', 'non-palette-bitmap.bmp');

