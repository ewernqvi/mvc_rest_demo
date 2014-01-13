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
app.use(express.basicAuth(function(user, pass, callback) {
var result = (user === 'testUser' && pass === 'testPass');
   callback(null /* error */, result);
   }));


//app.use(express.bodyParser());

app.use(express.json());
app.use(express.urlencoded());

var db = mongoskin.db('localhost:27017/test', {safe:true});;

app.param('collectionName', function(req, res, next, collectionName){
	req.collection = db.collection(collectionName);
	return next();
});

/*
app.get('/', function(req, res) {
	res.send('please select a collection, e.g., /collections/messages');
});
*/

app.get('/collections/:collectionName', function(req, res) {
  req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
	  if (e) return next(e);
          getClientIP(req);
	  res.send(results);
  });
});

app.post('/collections/:collectionName', function(req, res) {
  req.collection.insert(req.body, {}, function(e, results){
	  if (e) return next(e);
	  res.send(results);
  });
});


app.get('/collections/:collectionName/:id', function(req, res) {
  req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
	  if (e) return next(e);
	  res.send(result);
  });
});
app.put('/collections/:collectionName/:id', function(req, res) {
  req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
	  if (e) return next(e);
	  res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});
app.del('/collections/:collectionName/:id', function(req, res) {
  req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
	  if (e) return next(e);
	  res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});

app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});



app.listen(3000);
