<<<<<<< HEAD
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

=======
#!/usr/bin/env node

'use strict';

var transform = require(__dirname + '/lib/bitmap-transformer.js');

transform();
// calling transform() means one can execute from command line using ./index.js [argv2] [argv3] where [argv2] is the path for the file to open and [argv3] is the path for the file to write to

//NOTE that [argv2] must be in the img directory and [argv3] will be written to the same img directory
>>>>>>> f052ac2729a84d284ddac0bb35a711aaf320aa2f
