var path = require('path'),
    templateUtils = require('./lib/template-utils.js'),
    _ = require('lodash')
    ;

templateUtils.findRegistry(function(registry){
  templateUtils.chooseDirs(function(installDirs){
    templateUtils.pickFiles(registry,installDirs,function(files){
      _(installDirs).forEach(function(installDir){
        _(files).forEach(function(file){
          templateUtils.copyFile(file.path,path.resolve(installDir.path,file.name),function(err){
            if(err) throw err;
            console.log('copied ' + file.name + ' to ' + installDir.relativePath);
          });
        });
      });
    });
  });
});