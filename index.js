var fs = require('fs'),
    path = require('path'),
    gift = require('gift'),
    glob = require('glob'),
    clc = require('cli-color'),
    inquirer = require('inquirer'),
    _ = require('lodash')
    ;

function homeDir(){
  //http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function filterRegistry(filePath){
  var registryRaw = require(filePath);
  var filtered = {
    raw:registryRaw,
    files:[],
    path:filePath,
    dir:path.dirname(filePath),
    stats:fs.statSync(filePath)
  };
  _(registryRaw.files).forEach(function(fileDescription,fileName){
    var fullPath = path.resolve(filtered.dir,fileName);
    var exists = fs.existsSync(fullPath);
    var descriptor = {
      description : fileDescription,
      name:fileName,
      path:fullPath,
      exists: exists,
      stats: exists ? fs.statSync(fullPath) : false
    };
    filtered.files.push(descriptor);
  });
  return filtered;
}

function copyFile(source, target, cb) {
  //http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
//noinspection JSValidateTypes
inquirer.prompt([
  {
    name:'registry',
    type:'input',
    message:'registry file',
    validate:function(registryFile){
      if(fs.existsSync(registryFile)) {
        return true;
      }
      return clc.redBright(registryFile) + ' does not exist.';
    },
    when:function(answers){
      var def = 'live_template_registry.json';
      if(process.argv.length > 2){
        def = process.argv[2];
      }
      if(fs.existsSync(def)){
        answers.registry = filterRegistry(def);
        return false;
      }
      return true;
    },
    filter:filterRegistry
  },
  {
    name:'failBadRegistry',
    type:'confirm',
    'default':false,
    message:'Not all files listed in registry exist. There might be something wrong. Continue anyways?',
    when:function(answers){
      return  !_(answers.registry.files).all(function(file){
        return file.exists;
      });
    }
  },
  {
    name:'shouldnothappen',
    message:'barf',
    when:function(answers){
      if(answers.failBadRegistry === false){
        process.exit(1);
      }
      return false;
    }
  },
  {
    name:'dirs',
    type:'checkbox',
    message:'Where do you want the templates installed?',
    choices:function(){
      var opts = {cwd:homeDir()};
      var pattern = '{.,Library/Preferences/}{WebStorm,IntelliJIdea}*{/config/templates,/templates}';
      return glob.sync(pattern,opts);
    },
    validate:function(choices){
      if(choices.length > 0) return true;
      return 'Pick at least one install directory.'
    },
    filter:function(choices){
      var hd = homeDir();
      return _(choices).map(function(choice){
        return {
          path:path.resolve(hd,choice),
          relativePath:choice
        }
      }).valueOf();
    }
  },
  {
    name:'files',
    type:'checkbox',
    message:'Which files do you want to install?\n' +
        clc.redBright('   red') + ': existing file will be overwritten\n' +
        clc.blackBright.strike('  gray') + ': file missing',
    choices:function(answers){
      return _(answers.registry.files).map(
          function(file){
            var conflict = _(answers.dirs).any(function(dir){
              return fs.existsSync(path.resolve(dir.path,file.name));
            });
            var color = clc[conflict ? 'redBright' : 'cyan'];
            var descColor = clc.black;
            if(!file.exists){
              color = clc.blackBright.strike;
              descColor = clc.blackBright;
            }
            return {
              checked:file.exists,
              name: color(file.name) + descColor(': ' + file.description),
              value: file
            };
          }
      ).values().valueOf();
    }
  }
],function allDone(answers){
  var installDirs = answers.dirs;
  _(installDirs).forEach(function(installDir){
    _(answers.files).forEach(function(file){
      copyFile(file.path,path.resolve(installDir.path,file.name),function(err){
        if(err) throw err;
        console.log('copied ' + file.name + ' to ' + installDir.relativePath);
      });
    });
  });
});