'use strict';

module.exports = exports = function(){

  var fs = require('fs');
  var os = require('os');
  var EE = require('events').EventEmitter;
  var myEE = new EE();

  // Open file using fs and read it into a buffer
  //file to read is 1st command line arg

  myEE.on('open', function(){
    fs.readFile(__dirname + '/../img/' + process.argv[2], function(err, firstbuf){
      if (err) return console.log(err);
      printHeaderMetaData(firstbuf)

      if (fileType(firstbuf) === 'BM') {
        printMetaDataBM(firstbuf)
        myEE.emit('bufToObj', firstbuf); //data is a buffer
      } else {
        console.log("THE FILE TYPE IS NOT BM! ");
      }
    });
  });

  myEE.emit('open')

  // Convert buffer into a Javascript Object
  myEE.on('bufToObj', function(firstbuf){
    var obj =  firstbuf.toJSON() // {type: 'Buffer',  data : [decimal equivalents of the hex numbers]}
    if (paletteSize(firstbuf) === 0) { //if this has no color palette data (no color table)
      myEE.emit('transformNonPal', obj.data, firstbuf) // pass on the array of data
    }else {
      myEE.emit('transformPal', obj.data, firstbuf) // pass on the array of data
    }

  });

  // // Run a transform on that Javascript Object.
  myEE.on('transformNonPal', function(data, firstbuf){//here data refers to obj.data array

    invertNonPal(data, firstbuf)

    function invertNonPal(data, firstbuf){
      for (var i = pixelArrayOffset(firstbuf); i < data.length; i++){
        data[i] = 255 - data[i];  //invert the colors
      }
    }


   myEE.emit('toBuffer', data) // data should NOW be inverted

  });


  myEE.on('transformPal', function(data, firstbuf){ // data refers to obj.data array
    console.log("THIS IMAGE HAS PALETTE DATA! I NEED TO HANDLE THAT SITUATION, BUT FOR NOW, NO FILE WILL BE WRITTEN!")
  });


  // Turn the transformed object back into a buffer.
  myEE.on('toBuffer', function(data){  //this data is an array of the inverted data
    var finalbuf = new Buffer(data.length);
    for (var i = 0; i < finalbuf.length; i++){
      finalbuf[i] = data[i]
    }

    myEE.emit('write', finalbuf) //now data should be a buffer again
  })

  // Write that buffer to a new file.
  // file to write to is 2nd command line arg
  myEE.on('write', function(data){
    fs.writeFile(__dirname + '/../img/' + process.argv[3], data, function(){
      console.log("Transformed image has been saved")
    });
  });

  function fileType(data){
    return data.toString('utf8', 0 ,2)  // check for bmp type (BM, BA, CI, CP, IC, PT)
  }

  function pixelArrayOffset(data){
    return readUInt32(data, 10);
  }

  function paletteSize(data){
    return readUInt32(data, 10) - 54;
  }

  /// prints  header metadata for all file types
  function printHeaderMetaData(data) {
    console.log("first 2 bytes tell me this bitmap file type is " , data.toString('utf8', 0 ,2));

    console.log("bytes 2 - 5 tell me that this file is ", readUInt32(data, 2), " bytes in size");

    console.log("bytes 10 - 13 tell me that the offset of the pixel array is " , readUInt32(data, 10));

    if (paletteSize(data) !== 0) {
      console.log("the palette data  (color table) is ", paletteSize(data) , "bytes");
    }
    else {
      console.log("this file has no palette data (color table)");
    }
  }

  /////// prints metadata for BM files
  function printMetaDataBM(data){
    console.log("The size of the file header is ", readUInt32(data, 14) , " bytes");

    console.log("The width of the image is ", readUInt32(data, 18) , " pixels");

    console.log("The height of the image is ", readUInt32(data, 22) , " pixels");

    console.log("The number of color panes is ", readUInt16(data, 26));

    console.log("The color depth (number of bits per pixel) is", readUInt16(data, 28));

    console.log("The image size is of the raw bitmap file is ", readUInt32(data, 34), " bytes");

    console.log("The horizontal resolution ", readUInt32(data, 38), " pixels/meter");

    console.log("The veritcal resolution ", readUInt32(data, 42), " pixels/meter");
  }

  //// determines which "endianess" your comptuer is using, and selects the correct method of reading unsigned integers
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
