var git = require('gift');

var repo = git('.');

repo.status(function(err,status){
  if(err) throw err;
  console.log(status);
});
