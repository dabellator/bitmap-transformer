#!/usr/bin/env node

'use strict';

var transform = require(__dirname + '/lib/bitmap-transformer.js');

transform();
// calling transform() means one can execute from command line using ./index.js [argv2] [argv3] where [argv2] is the path for the file to open and [argv3] is the path for the file to write to

//NOTE that [argv2] must be in the img directory and [argv3] will be written to the same img directory
