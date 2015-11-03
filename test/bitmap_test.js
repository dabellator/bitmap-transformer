var expect = require('chai').expect;
var fs = require('fs');
var Bitmap = require(__dirname + '/../lib/read');
var transform = require(__dirname + '/../lib/transform');
var bitmap = {};

describe('the read module', function() {

  before(function() {
    var file = fs.readFileSync(__dirname + '/../palette-bitmap.bmp');
    bitmap = new Bitmap(file);
  });

  it('should be parsing bitmap data', function() {
    expect(bitmap.type).to.eql('BM');
  });

  after(function() {
    bitmap = {};
  });
});

describe('the transform module', function() {

  before(function() {
    var file = fs.readFileSync(__dirname + '/../palette-bitmap.bmp');
    bitmap = new Bitmap(file);
    bitmap.applyFilter(transform,'red');
  });

  it('should transform a color channel', function() {
    expect(bitmap.colorPalette[2]).to.eql(255);
  });

});

