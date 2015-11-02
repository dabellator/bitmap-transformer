var EE = require('events').EventEmitter;
var process = new EE();
var reader = require('./lib/read');
var modifier = require('./lib/transform');
var bitmap = {};

process.on('open', function(file) {

  bitmap = reader(file);
  process.emit('modify', 'transform', 'green');
});

process.on('modify', function(filter, type) {

  bitmap.applyFilter(modifier[filter], type);
  process.emit('write', 'event.bmp');
});

process.on('write', function(name) {

  bitmap.write(name);
});

process.emit('open', 'non-palette-bitmap.bmp');

