var clc = require('cli-color');

module.exports = {
  normal:{
    fileName:clc.cyan,
    description:clc.black
  },
  missing:{
    fileName:clc.blackBright.strike,
    description:clc.blackBright
  },
  conflict:{
    fileName:clc.redBright,
    description:clc.black
  },
  missingConflict:{
    fileName:clc.blackBright.strike,
    description:clc.blackBright
  },
  noRegistry:clc.redBright,
  descriptorColor:function(missing,conflict){
    if(conflict){
      return missing ? colors.missingConflict : colors.conflict;
    }
    return missing ? colors.missing : colors.normal;
  }
};

var colors = module.exports;