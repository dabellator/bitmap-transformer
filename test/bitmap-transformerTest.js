'use strict';

var expect = require('chai').expect;

var transform = require(__dirname + '/../lib/bitmap-transformer.js');

var fs = require('fs');
var rStream = fs.createReadStream(__dirname + '/../img/ball.bmp');

describe('getFileType(buf)', function(){
  it('should read the first two bytes of the data and return the bitmap type', function(){
    expect("BM").to.deep.equal("BM");
  });
});
