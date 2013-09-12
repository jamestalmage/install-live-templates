var path = require('path'),
    templateUtils = require('./lib/template-utils.js'),
    _ = require('lodash'),
    q = require('q');
    ;

templateUtils
    .findRegistry()
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
    });
