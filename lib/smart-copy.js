var fs = require('fs'),
    async = require('async'),
    carrier = require('carrier'),
    xml2js = require('xml2js');


var startContext = /^\s*<\s*context\s*>\s*$/i;
var endContext = /^\s*<\s*\/\s*context\s*>\s*$/i;

function isBooleanString(str){
  str = str.toLowerCase();
  return (str === 'true') || (str === 'false');
}

function optionLine(line){
  var opl = {
    line:line,
    done:false,
    validXml:false,
    validOption:false
  };
  var parser = new xml2js.Parser({async:false});
  parser.parseString(line,function(err,result){
    opl.done = true;
    if(err){
      opl.err = err;
      return;
    }
    opl.validXml = true;
    opl.result = result;
  });
  if(!opl.done){
    throw new Error('xml2js did not call synchronously - OH NO!');
  }
  if(!opl.validXml){
    throw new Error(line + ' is not valid xml.',opl.err);
  }
  var tagNames = Object.getOwnPropertyNames(opl.result);
  if(!(tagNames.length === 1 && tagNames[0] === 'option')){
    console.log(line + ' is not a valid option object');
    return opl;
  }
  var option = opl.result.option;
  var attrs = option.$;
  if(!(attrs.hasOwnProperty('name') && attrs.hasOwnProperty('value') && isBooleanString(attrs.value)) ){
    console.log(line + ' is not a valid option object');
    return opl;
  }
  opl.name = attrs.name;
  opl.value = (attrs.value.toLowerCase() === 'true');
  opl.validOption = true;
  if(Object.getOwnPropertyNames(option).length !== 1 || (Object.getOwnPropertyNames(attrs).length !== 2)){
    opl.hasExtras = true;
    console.log(line + ' has some extra unexpected stuff in it - report to project author');
  }
  return opl;
}

function smartCopy(inputPath,outputPath,cb){

  var input = fs.createReadStream(inputPath);
  var output = fs.createWriteStream(outputPath);
  var inContext = false;

  carrier.carry(input)
      .on('line',function(line){
        if(inContext){
          if(endContext.test(line)){
            inContext = false;
            output.write(line + '\r\n');
          }
          else {
            var opl = optionLine(line);
            if(!opl.validOption){
              throw new Error(line + ' is not a valid option');
            }
            if(opl.value || opl.hasExtras){
              output.write(line + '\r\n');
            }
          }
        }
        else {
          output.write(line + '\r\n');
          if(startContext.test(line)){
            inContext = true;
          }
        }
      })
      .on('end',function(){
        output.end();
        cb();
      });
}

module.exports = smartCopy;
