var express = require('express')
, mongoskin = require('mongoskin')
, fs = require('fs')
, routeFactory = require('./routes');

fs.mkdir('/tmp', function(e,r){ 
  if(!e) fs.mkdir('/tmp/img', function(e,r){});
});

function log(msg){
  console.log(msg);
}

var app = express();

app.use(express.bodyParser({uploadDir:'/tmp/img'}));
app.use(express.json());
app.use(express.urlencoded());

var db = mongoskin.db('localhost:27017/test_db', {safe:true});
var routes = routeFactory.routes(db, log);

app.use(function(err, req, res, next) {
  // only handle `next(err)` calls
  console.log('Error: ' + err);
  if(err.status){
    res.send(err.status);
  }
  else{
    res.send(500, 'Houston we have a problem!');
  }
});

var auth = express.basicAuth(function(user, pass, callback) {
  routes.auth(user, pass, function(result){
    //console.log('result: '+ result);
    callback(null, result);
  });
});

/**
 * Custom authentication solution, needed to get rid of user pop-up in browser if 401 is returned
 * the browser displays a login dialog
 */
auth = function(req, res, next) {
  var authorization = req.headers.authorization;
  var parts = authorization.split(' ');
  if (parts.length !== 2) {res.send(400, 'error: not a proper header'); return};
  var scheme = parts[0]
    , credentials = new Buffer(parts[1], 'base64').toString()
    , index = credentials.indexOf(':');
  if ('Basic' != scheme || index < 0) {res.send(400, 'error: not a proper header'); return};
  var user = credentials.slice(0, index)
    , pass = credentials.slice(index + 1);
  //console.log('user: '+ user + ' pass: ' + pass);
  routes.auth(user, pass, function(result){
    //console.log('result: '+ result);
    if(result) next();
    else res.send(418,  'invalid credentials supplied!');
  });
};
app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName);
  return next();
});


//
// ============================ ROUTES ======================================
//

// This route is used to authenticate a user, it is protected with basic auth 
// and returns a user object including a user_token that can be used for 
// upcoming actions
app.get('/api/users/:id', auth, routes.handleLogin);
app.get('/api/users', routes.accessDenied);
app.post('/api/images',routes.handleImage);
app.del('/api/images/:id', routes.handleDelImage);
app.get('/api/:collectionName', routes.handleListResult);
app.post('/api/:collectionName', routes.handlePost);
app.get('/api/:collectionName/:id', routes.handleSingleResult);
app.put('/api/:collectionName/:id', routes.handlePut);
app.del('/api/:collectionName/:id', routes.handleDelete);

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

console.log('go to http://localhost:3000/api/advertisments');
app.listen(3000);
