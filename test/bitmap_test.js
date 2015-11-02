var expect = require('chai').expect;
var read = require(__dirname + '/../lib/read');
var transform = require(__dirname + '/../lib/transform');
var bitmap = {};

describe('the read module', function() {

  before(function() {
    bitmap = read(__dirname + '/../palette-bitmap.bmp');
    bitmap.applyFilter(transform.transform,'red');
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
    bitmap = read(__dirname + '/../palette-bitmap.bmp');
    bitmap.applyFilter(transform.transform,'red');
  });

  it('should transform a color channel', function() {
    expect(bitmap.colorPalette[2]).to.eql(255);
  });

});

