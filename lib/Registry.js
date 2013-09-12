var path = require('path');
var _ = require('lodash');
var FileDescriptor = require('./FileDescriptor.js');

function Registry(filePath){
  this.raw = require(path.resolve(process.cwd(),filePath));
  this.path = filePath;
  var dir = this.dir = path.dirname(filePath);
  var files = this.files = [];
  _(this.raw.files).forEach(function(fileDescription,fileName){
    files.push(new FileDescriptor(dir,fileName,fileDescription));
  });
}

module.exports = Registry;