var git = require('gift');

var repo = git('.');

repo.branch(function(err,status){
  if(err) throw err;
  console.log(status);
});
