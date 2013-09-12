var path = require('path');
var fs = require('fs');

function FileDescriptor(baseDir,relativePath,description){
  this.baseDir = baseDir;
  this.relativePath = relativePath;
  this.description = description;
  this.path = this.fullPath = path.resolve(this.baseDir,this.relativePath);
  this.name = path.basename(this.fullPath);
  this.exists = fs.existsSync(this.fullPath);
  if(this.exists){
    this.stats = fs.statSync(this.fullPath);
  }
}

module.exports = FileDescriptor;