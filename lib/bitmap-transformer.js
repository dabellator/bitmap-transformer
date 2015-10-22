'use strict';

var fs = require('fs');
var os = require('os');

//file to read is 1st command line arg
var rStreamPal = fs.createReadStream(__dirname + '/' + process.argv[2]);
// file to write to is 2nd command line arg
var wStreamPal = fs.createWriteStream(__dirname + '/' + process.argv[3]);

var hasPalette;
var paletteSize;

(function mainProgram() {
  var chunkCounter = 0;
  rStreamPal.on('data', function(chunk){// when data comes in, the chunk buffers will run though the changeColors function, and the results will be piped to wStreamPal
    chunkCounter ++;
    if (chunkCounter === 1){
      // console.log("chunk length ", chunk.length) // chunk lengths seem to be up to about 65000 bytes (whole file if less than that) SO IT SHOULD read all metadata in the first chunk no matter what.
      // console.log('readUInt16 ', readUInt16(chunk, 0)) // 19778??? huh?
      console.log("first 2 bytes tell me this bitmap file type is ", chunk.toString('utf8', 0 ,2)); // check for bmp type (BM, BA, CI, CP, IC, PT)

      console.log("bytes 2 - 5 tell me that this file is ", readUInt32(chunk, 2), " bytes in size");

      console.log("bytes 10 - 13 tell me that the offset of the pixel array is " , readUInt32(chunk, 10));

      if (readUInt32(chunk, 10) === 54) {
        console.log("this file has no palette data");
      }

      else {
        hasPalette = true;
        paletteSize = readUInt32(chunk, 10) - 54 ;
        console.log("the palette data is ", paletteSize , "bytes")
      }

      if (chunk.toString('utf8', 0, 2) === "BM") {
        console.log("The size of the file header is ", readUInt32(chunk, 14) , " bytes");

        console.log("The width of the image is ", readUInt32(chunk, 18) , " pixels");

        console.log("The width of the image is ", readUInt32(chunk, 22) , " pixels");

        console.log("The number of color panes is ", readUInt16(chunk, 26));

        console.log("The color depth (number of bits per pixel) is", readUInt16(chunk, 28));
        if (readUInt32(chunk, 30) === 0){
        console.log(" the image is not compressed");
        }
        else {
          console.log("well it's compressed, but that's all I know about that right now!")
        }

        console.log("The image size is of the raw bitmap file is ", readUInt32(chunk, 34), " bytes");

        console.log("The horizontal resolution ", readUInt32(chunk, 38), " pixels/meter");

        console.log("The veritcal resolution ", readUInt32(chunk, 42), " pixels/meter");

        if (readUInt32(chunk, 38) !== 0){
          console.log("The number of colors in the color palette is ", readUInt32(chunk, 38))
        }
        else {
          console.log("The number of colors in the color palette is 2^n..... I guess?")
        }

        if (readUInt32(chunk, 50) !== 0) {
          console.log("The number of important colors used is  ", readUInt32(chunk, 50));
        }
        else {
          console.log("All colors in this file are important")
        }

      }
      else { console.log("well, I haven't put any code for non-BM files in yet.")}
    }
   console.log("chunks so far: ", chunkCounter)

    changeColors(chunk)
  })

  .pipe(wStreamPal); // send transformed data chunks to writestream; will write to the file specified in wStreamPal

})();// end main


function changeColors(buf){
  var imageDataBegins = 54;
  if (hasPalette) {
    imageDataBegins = paletteSize;
  }

  Array.prototype.forEach.call(buf, function(current, index, array){
    if (index >= imageDataBegins  ) { // first image data is at byte number 54 (assuming BM file type)
      buf[index] = (buf[index] + 201) * 97 ;
    }
  })
}


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
