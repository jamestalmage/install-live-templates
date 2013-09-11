var fs = require('fs'),
    path = require('path'),
    gift = require('gift'),
    glob = require('glob'),
    async = require('async'),
    clc = require('cli-color'),
    inquirer = require('inquirer'),
    _ = require('lodash')
    ;

function homeDir(){
  //http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function filterRegistry(path){
  var registryRaw = require(path);
  return {
    raw:registryRaw,
    files:registryRaw.files,
    path:path
  };
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
      var registryDir = path.dirname(answers.registry.path);
      return  !_(answers.registry.files).all(function(desc,file){
        console.log('checking: ' + file);
        return fs.existsSync(path.resolve(registryDir,file));
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
    choices:function(answers){
      var opts = {cwd:homeDir()};
      var pattern = '{.,Library/Preferences/}{WebStorm,IntelliJIdea}*{/config/templates,/templates}';
      return glob.sync(pattern,opts);
    },
    validate:function(choices){
      if(choices.length > 0) return true;
      return 'Pick at least one install directory.'
    }
  },
  {
    name:'files',
    type:'checkbox',
    message:'Which files do you want to install?' +
        clc.redBright('red highlight means that an existing file will be overwritten'),
    choices:function(answers){
      return _(answers.registry.files).map(
          function(description,file){
            var conflict = _(answers.dirs).any(function(dir){
              return fs.existsSync(path.resolve(homeDir(),dir,file));
            });
            return {
              checked:true,
              name: clc[conflict ? 'redBright' : 'cyan'](file + ': ') + description,
              value:file
            };
          }
      ).values().__wrapped__;
    }
  }
],function allDone(answers){

});