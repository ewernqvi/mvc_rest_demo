var express = require('express')
, mongoskin = require('mongoskin')
, routeFactory = require('./routes');


function log(msg){
  //console.log(msg);
}

var app = express();

app.use(express.bodyParser({uploadDir:'/tmp/img'}));
app.use(express.json());
app.use(express.urlencoded());

var db = mongoskin.db('localhost:27017/test_db2', {safe:true});;
var routes = routeFactory.routes(db, log);

var auth = express.basicAuth(function(user, pass, callback) {
  routes.auth(user, pass, callback);
});

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
