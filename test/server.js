/**
 * Module dependencies.
 */

var express = require('express');

var app = express();

app.set('json spaces', 0);

app.use(function(req, res, next){
  if ('/echo' != req.url) return next();
  res.set(req.headers);
  req.pipe(res);
});

app.get('/', function(req, res){
  res.redirect('/test/');
});

app.use(express.bodyParser());
app.use(express.static(__dirname + '/../'));
if(!module.parent) {
  app.listen(3000);
  console.log('Test server listening on port 3000');
} else {
  module.exports = app;
}

