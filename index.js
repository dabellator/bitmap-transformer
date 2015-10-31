var EE = require('events').EventEmitter;
var process = new EE();
var reader = require('./read');
var modifier = require('./transform');
var bitmap = {};

process.on('open', function(file) {

  bitmap = reader(file);
  process.emit('modify', 'transform', 'red');
});

process.on('modify', function(filter, type) {

  bitmap.applyFilter(modifier[filter], type);
  process.emit('write', 'event.bmp');
});

process.on('write', function(name) {

  bitmap.write(name);
});

process.emit('open', 'palette-bitmap.bmp');

