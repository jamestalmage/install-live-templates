var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    inquirer = require('inquirer'),
    Registry = require('./Registry.js'),
    colors = require('./colors.js'),
    _ = require('lodash'),
    q = require('q')
    ;

var templateUtils;

function homeDir(){
    //http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
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

function filterRegistry(filePath){
  return new Registry(filePath);
}

function findRegistry(cb){
  var deferred = q.defer();
  inquirer.prompt([
    {
      name:'registry',
      type:'input',
      message:'registry file',
      validate:function(registryFile){
        if(fs.existsSync(registryFile)) {
          return true;
        }
        return colors.noRegistry(registryFile) + ' does not exist.';
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
    }
  ],function(answers){
    deferred.resolve(answers.registry);
    if(cb){
      cb(answers.registry);
    }
  });
  return deferred.promise;
}

function chooseDirs(cb){
  var deferred = q.defer();
  inquirer.prompt([
    {
      name:'dirs',
      type:'checkbox',
      message:'Where do you want the templates installed?',
      choices:function(){
        var opts = {cwd:templateUtils.homeDir()};
        var pattern = '{.,Library/Preferences/}{WebStorm,IntelliJIdea}*{/config/templates,/templates}';
        return glob.sync(pattern,opts);
      },
      validate:function(choices){
        if(choices.length > 0) return true;
        return 'Pick at least one install directory.'
      },
      filter:function(choices){
        var hd = templateUtils.homeDir();
        return _(choices).map(function(choice){
          return {
            path:path.resolve(hd,choice),
            relativePath:choice
          }
        }).valueOf();
      }
    }
  ],function(answers){
    deferred.resolve(answers.dirs);
    if(cb){
      cb(answers.dirs);
    }
  });
  return deferred.promise;
}



function pickFiles(registry,installDirs,cb){
  var deferred = q.defer();
  inquirer.prompt([
    {
      name:'files',
      type:'checkbox',
      message:'Which files do you want to install?\n' +
          colors.descriptorColor(false,true).fileName('   red') + ': existing file will be overwritten\n' +
          colors.descriptorColor(true,false).fileName('  gray') + ': file missing',
      choices:function(){
        return _(registry.files).map(
            function(file){
              var conflict = _(installDirs).any(function(dir){
                return fs.existsSync(path.resolve(dir.path,file.name));
              });

              var color = colors.descriptorColor(!file.exists,conflict);

              return {
                checked:file.exists,
                name: color.fileName(file.name) + color.description(': ' + file.description),
                value: file
              };
            }
        ).values().valueOf();
      },
      validate:function(choices){
        for(var i in choices){
          if(choices.hasOwnProperty(i)){
            if(!choices[i].exists){
              return choices[i].name + ' is missing from registry. Deselect to continue.';
            }
          }
        }
        return true;
      }
    }
  ],function(answers){
    deferred.resolve(answers.files);
    if(cb){
      cb(answers.files);
    }
  });
  return deferred.promise;
}

templateUtils = module.exports = {
  homeDir:homeDir,
  copyFile:copyFile,
  findRegistry:findRegistry,
  chooseDirs:chooseDirs,
  pickFiles:pickFiles
};