var fs = require('fs'),
    path = require('path'),
    gift = require('gift'),
    glob = require('glob'),
    async = require('async'),
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


_(glob.sync(pattern,globOpts())).forEach(function(val){
   console.log(val);
});