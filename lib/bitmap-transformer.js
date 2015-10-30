'use strict';

module.exports = exports = function(){

  var fs = require('fs');
  var os = require('os');

  //file to read is 1st command line arg
  var rStream = fs.createReadStream(__dirname + '/../img/' + process.argv[2]);
  // file to write to is 2nd command line arg
  var wStream = fs.createWriteStream(__dirname + '/../img/' + process.argv[3]);

  (function mainProgram() {
    var chunkCounter = 0;

    rStream.on('data', function(chunk){// when data comes in, the chunk buffers will run though the changeColors function, and the results will be piped to wStreamPal

      chunkCounter ++;

      console.log("chunk length ", chunk.length)
      if (chunkCounter === 1){ // chunk lengths seem to be up to about 65000 bytes (or whole file if file size is less than that). So it reads all metadata in the first chunk.

        getMainMetaData(chunk);

        if (getFileType(chunk) === "BM") {
          getMetaDataBM(chunk);
        }
        else {console.log("well, I haven't put any code for non-BM files in yet.")}
      }

      changeColors(chunk)

      console.log("chunks processed so far: ", chunkCounter)

    })

    .pipe(wStream); // send transformed data chunks to wStream, which will write to the file specified

  })();// end main


  function getFileType(chunk){
    return chunk.toString('utf8', 0 ,2)  // check for bmp type (BM, BA, CI, CP, IC, PT)
  }

  function getFileSize(chunk){
    return readUInt32(chunk, 2);
  }

  function getPixelArrayOffset(chunk){
    return readUInt32(chunk, 10);
  }

  function getPaletteSize(chunk){
    return readUInt32(chunk, 10) - 54;
  }

  function getHeaderSizeBM(chunk){
    return readUInt32(chunk, 14);
  }

  function getImgWidthBM(chunk){
    return readUInt32(chunk, 18);
  }

  function getImgHeightBM(chunk){
    return readUInt32(chunk, 22);
  }

  function getColorPanesBM(chunk){
    return readUInt16(chunk, 26);
  }

  function getColorDepthBM(chunk){
    return readUInt16(chunk, 28);
  }

  function getCompressionBM(chunk){
    return readUInt32(chunk, 30);
  }

  function getRawBitmapSizeBM(chunk){
    return  readUInt32(chunk, 34);
  }

  function getHorizontalResolutionBM(chunk){
    return readUInt32(chunk, 38);
  }

  function getVerticalResolutionBM(chunk){
    return readUInt32(chunk, 42);
  }

  function getColorPaletteColorNumBM(chunk) {
    return readUInt32(chunk, 38);
  }

  function getImportantColorNumBM(chunk){
    return readUInt32(chunk, 50);
  }

  function getMainMetaData(chunk){
    getFileType(chunk);

    getFileSize(chunk);

    getPixelArrayOffset(chunk);

    getPaletteSize(chunk);

    printMainMetaData(chunk);
  }

  function getMetaDataBM(chunk){
    getHeaderSizeBM(chunk);

    getImgWidthBM(chunk);

    getImgHeightBM(chunk);

    getColorPanesBM(chunk);

    getColorDepthBM(chunk);

    getCompressionBM(chunk);

    getRawBitmapSizeBM(chunk);

    getHorizontalResolutionBM(chunk);

    getVerticalResolutionBM(chunk);

    getColorPaletteColorNumBM(chunk);

    getImportantColorNumBM(chunk);

    printMetaDataBM(chunk);
  }

  function printMainMetaData(chunk) {
    console.log("first 2 bytes tell me this bitmap file type is " , chunk.toString('utf8', 0 ,2));
    //must use toString because this converts the digits to decimal and THEN to ascii using the decimals.

    console.log("bytes 2 - 5 tell me that this file is ", readUInt32(chunk, 2), " bytes in size");
    // readUInt32LE takes 4 bytes, starting at the offset, and flips the hex number order (Least significant first). THEN converts the NEW ordered digits to decimal.  e.g. 66 75 00 00 becomes 00007566 which, is the same as 7566 in hex. 0x7566 is equivalent to 30054 decimal.

    console.log("bytes 10 - 13 tell me that the offset of the pixel array is " , readUInt32(chunk, 10));

    if (getPaletteSize(chunk) !== 0) {
      console.log("the palette data is ", getPaletteSize(chunk) , "bytes");
    }
    else {
      console.log("this file has no palette data");
    }
  }

  function printMetaDataBM(chunk){
    console.log("The size of the file header is ", readUInt32(chunk, 14) , " bytes");

    console.log("The width of the image is ", readUInt32(chunk, 18) , " pixels");

    console.log("The height of the image is ", readUInt32(chunk, 22) , " pixels");

    console.log("The number of color panes is ", readUInt16(chunk, 26));

    console.log("The color depth (number of bits per pixel) is", readUInt16(chunk, 28));

    if (getCompressionBM(chunk) === 0){
    console.log("The image is not compressed");
    }
    else {
      console.log("well it's compressed, but that's all I know about that right now!");
    }

    console.log("The image size is of the raw bitmap file is ", readUInt32(chunk, 34), " bytes");

    console.log("The horizontal resolution ", readUInt32(chunk, 38), " pixels/meter");

    console.log("The veritcal resolution ", readUInt32(chunk, 42), " pixels/meter");

    if (getColorPaletteColorNumBM(chunk)!== 0){
      console.log("The number of colors in the color palette is ", readUInt32(chunk, 38))
    }
    else {
      console.log("The number of colors in the color palette is 2^n..... I guess?")
    }

    if (getImportantColorNumBM(chunk) !== 0) {
      console.log("The number of important colors used is  ", readUInt32(chunk, 50));
    }
    else {
      console.log("All colors in this file are important")
    }

  }

  var firstChunk = true; // needed this global variable so changeColors() will start at the beginning of subsequent data chunks. Otherwise subsequent chunks don't start at the right byte, and the data does not get transformed properly

  // function changeColors(buf){

  //   var imageDataBegins = getPixelArrayOffset(buf);
  //   if (!firstChunk) { imageDataBegins = 0 }
  //   Array.prototype.forEach.call(buf, function(current, index, array){
  //     if (index >= imageDataBegins  ) { // first image data is at byte number 54 (assuming BM file type)
  //       buf[index] = buf[index] * 2 ;  //THES ARE COUNTING BYTES!
  //     }
  //   })
  //   firstChunk = false;  /// how can I do this without resorting to a global variable firstChunk?
  // }



  function changeColors(buf){

    var imageDataBegins = getPixelArrayOffset(buf);
    if (!firstChunk) { imageDataBegins = 0 }
    Array.prototype.forEach.call(buf, function(current, index, array){
      if (index >= imageDataBegins  ) { // first image data is at byte number 54 (assuming BM file type)
        buf[index] = buf[index] * 2 ;  //THESE ARE COUNTING BYTES!
      }
    })
    firstChunk = false;
  }


  // function changeColorPalette(buf){
    //1024 bytes, from bytes 54 to 1078  = 1024 bytes/ 4 colors = 256 total colors
  //   var alpha = //every 4th, offest 0  so bytes 54, 58, 62.. 1074
   // SO  buf[index] %
  //   var green = //every 4th, offset 1 so bytes 55, 59, 63... 1075
  //   var blue = //every 4th, offset 2 so bytes 56, 60 ,64, ... 1076
  //   var red = // every, 4th offset 3 so bytes 57, 61, 65,.... 1077

  // }

//for non-palette bitmaps, then each pixel is 3 times the data (no alpha???)  so rgb... reverse to bgr becasue of LE
//so for pixel 1 on byte 54 it is REALLY bytes 54, 55, 56 which correstpond to pilel1-blue, pixel1-green, pixel1-red respectively

// function changeNonPalette(buf){
//  for every 3 pixels,  blue  = %1 only , green = %2 only, red = %3 only so  buf[index] %3 (and NOT 2) --> red  buf[index] %2 (and NOT 3) -->green,  if NEITHER then blue
// }



  function readUInt32(buf, offset) {
    if (os.endianness() === 'BE') {
      return buf.readUInt32BE(offset);
    }
    return buf.readUInt32LE(offset)
  }

  function readUInt16(buf, offset) {
    if (os.endianness() === 'BE') {
      return buf.readUInt16BE(offset);
    }
    return buf.readUInt16LE(offset)
  }

} // end module exports function




