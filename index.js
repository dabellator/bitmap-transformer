var EE = require('events').EventEmitter;
var fs = require('fs');
var myEE = new EE();
var Bitmap = require('./lib/read');
var modifier = require('./lib/transform');
var bitmap = {};

myEE.on('open', function(file) {
  console.log(file);
  fs.readFile(__dirname + '/' + file, function(err, buf) {

    if (err) throw err;
    bitmap = new Bitmap(buf);
    myEE.emit('modify', process.argv[3]);
  });
});

myEE.on('modify', function(type) {

  bitmap.applyFilter(modifier, type);
  myEE.emit('write', process.argv[4]);
});

myEE.on('write', function(name) {

  bitmap.write(name);
});

myEE.emit('open', process.argv[2]);

