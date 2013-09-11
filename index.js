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

function globOpts(){
  return {cwd:homeDir()};
}

var pattern =
    '{.,Library/Preferences/}{WebStorm,IntelliJIdea}*{/config/templates,/templates}';


var dirs = glob.sync(pattern,globOpts());

var files = require('../angularjs-webstorm-livetpls/live_template_registry.json').files;

var filesChecked = _(files).map(function(description,file){

  var conflict = _(dirs).any(function(dir){
    return fs.existsSync(path.resolve(homeDir(),dir,file));
  });

  return {
    checked:true,
    name: clc[conflict ? 'red' : 'blue'](file + ': ') + description,
    value:file
  };
}).values().__wrapped__;


console.log(filesChecked);
//noinspection JSValidateTypes
inquirer.prompt([
  {
    name:'dirs',
    type:'checkbox',
    message:'Where do you want the templates installed?',
    choices:dirs
  },
  {
    name:'files',
    type:'checkbox',
    message:'Which files do you want to install?',
    choices:filesChecked
  }
],function allDone(answers){
  console.log(answers.dirs);
  console.log(answers.files);


});