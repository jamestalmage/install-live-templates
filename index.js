var path = require('path'),
    templateUtils = require('./lib/template-utils.js'),
    _ = require('lodash'),
    q = require('q'),
    fs = require('fs')
    ;

function install(registryFilePath){
  templateUtils
      .findRegistry(registryFilePath)
      .then(function(registry){
        return [registry,templateUtils.chooseDirs()]
      })
      .spread(function(registry,installDirs){
        return [installDirs,templateUtils.pickFiles(registry,installDirs)];
      })
      .spread(function(installDirs,files){
        _(installDirs).forEach(function(installDir){
          _(files).forEach(function(file){
            templateUtils.copyFile(file.path,path.resolve(installDir.path,file.name),function(err){
              if(err) throw err;
              console.log('copied ' + file.name + ' to ' + installDir.relativePath);
            });
          });
        });
      }).done();
}

function backup(registryFilePath){
  templateUtils
      .findRegistry(registryFilePath)
      .then(function(registry){
        return [registry,templateUtils.chooseDir()]
      }).spread(function(registry,dir){
        _(registry.files).forEach(function(file){
          var src = path.resolve(dir.path,file.relativePath);
          if(fs.existsSync(src)){
            templateUtils.copyFile(src,file.path,function(err){
              if(err) {
                console.log(err);
                throw err;
              }
              console.log('copied ' + file.name + ' from ' + dir.relativePath);
            });
          }
          else {
            console.log(file.name + ' not installed');
          }
        });
      }).done() ;
}

var method = {backup:backup,install:install}[process.argv[2]];

if(!method){
  console.log('usage is:');
  console.log('install [registryFile]');
  console.log('backup [registryFile]');
}
else {
  var filePath = 'live_template_registry.json';
  if(process.argv.length > 3){
    filePath = process.argv[3];
  }
  method(filePath);
}