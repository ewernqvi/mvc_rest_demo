var express = require('express')
, mongoskin = require('mongoskin');


function getClientIP(req){
	var ip = req.headers['x-forwarded-for'] || 
	  req.connection.remoteAddress || 
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
  console.log(ip);
  return ip;
}

var app = express();

// Authenticator
var auth = express.basicAuth(function(user, pass, callback) {
	// TODO check user database if supplied user exist
	 var result = (user === 'erik@wernqvist.eu' && pass === 'password');
	  callback(null /* error */, result);
});


//app.use(express.bodyParser());

app.use(express.json());
app.use(express.urlencoded());

var db = mongoskin.db('localhost:27017/test_db2', {safe:true});;

app.param('collectionName', function(req, res, next, collectionName){
	req.collection = db.collection(collectionName);
	return next();
});

/*
app.get('/', function(req, res) {
	res.send('please select a collection, e.g., /collections/messages');
});
*/

// This route is used to authenticate a user, it is protected with basic auth and returns a user object
// including a user_token that can be used for upcoming actions
app.get('/user/user/:id', auth, function(req, res){
  req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
	  if (e) return next(e);
	  res.send(result);
  });

});

app.get('/api/:collectionName', function(req, res) {
	console.log('calling api with '+ req.headers);
  req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
	  if (e) return next(e);
	  res.send(results);
  });
});

app.post('/api/:collectionName', function(req, res) {
  req.collection.insert(req.body, {}, function(e, results){
	  if (e) { res.send(JSON.stringify(e));}else{
	    res.send(results);
	  }
  });
});


app.get('/api/:collectionName/:id', function(req, res) {
  req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
	  if (e) return next(e);
	  res.send(result);
  });
});
app.put('/api/:collectionName/:id', function(req, res) {
	if(!req.headers['user-token']){
		res.send(406,{msg: 'error: user-token must be set in http header to perform an update'});
		return;
	}
  req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
	  if (e) res.send(500, e);
	  else{
	    res.send( (result===1)?{msg:'success'}:{msg:'error'});
	  } 
  });
});
app.del('/api/:collectionName/:id', function(req, res) {
  req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
	  if (e) return next(e);
	  res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});



app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(function(err, req, res, next){
	  console.error(err.stack);
	    res.send(500, 'Something broke!');
	});
});



app.listen(3000);
