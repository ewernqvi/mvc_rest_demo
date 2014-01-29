var express = require('express')
, mongoskin = require('mongoskin')
, fs = require('fs');

var userTokens = [];

function getClientIP(req){
  var ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  log(ip);
  return ip;
}

function log(msg){
  //console.log(msg);
}

var app = express();

// Authenticator
var auth = express.basicAuth(function(user, pass, callback) {
  var user_db = db.collection('users');
  user_db.findOne({_id: user}, function(e, result){
    if (e) return next(e);
    var authenticated = ( result && result.password && pass === result.password);
    callback(null /* error */, authenticated);
  });
});


app.use(express.bodyParser({uploadDir:'/tmp/img'}));

app.use(express.json());
app.use(express.urlencoded());

var db = mongoskin.db('localhost:27017/test_db2', {safe:true});;

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName);
  return next();
});

var rand = function() {
  return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
  return rand() + rand(); // to make it longer
};

function findUserFromToken(token){
  for(k in userTokens){
    if(userTokens[k] === token) return k;
  }
  return null;
}

function handleLogin(req, res){
  req.collection = db.collection('users');
  log('trying to login: '+ req.path+ ' ' + req.params.id);
  var id = req.collection.id(req.params.id);
  req.collection.findOne({_id: id}, function(e, result){
    if (e) return next(e);
    userTokens[id] = token();
    result.userToken = userTokens[id];
    res.send(result);
  });
}

function accessDenied(req, res){
  res.send(406, '{error: "Access Denied"}');
}

/**
 * Generic function to handle list retreival from mongod
 * @param req, input, note that filter can be passed in body or as q-params
 * @param res, http-response stream
 */
function handleListResult(req, res){
  var user;
  if(req.headers['user-token']){
    user = findUserFromToken(req.headers['user-token']);
    log('**** user: ' + user + ' derived from: ' + req.headers['user-token']);
    if(!user){
      res.send(401, '{error: "Supplied token is no longer valid, retreive a new '+
        'token by /api/users/:id providing a valid username and password"}');
      return;
    }
  }
  var filter=null;
  if(req.query.filter) filter=JSON.parse(req.query.filter);
  req.collection.find({}).toArray(function(e, results){
    if (e) { console.log('#### Mongo err: ' + e); res.send(500, e)};
    if (req.params.collectionName)
      appendLinks2Result(results, user, req.params.collectionName);
  if(filter){
    var resx=[];
    resx.push(results[0]);
    console.log('TODO: FixME!!!');
    res.send(resx);
  }else{
    res.send(results);
  }
  });
}



function appendLinks2Result(results, user, resource){
  log('appending links for '+resource+' resources owned by '+ user);
  for(var i=0; i<results.length; i++){
    var rec=results[i];
    var href='/api/' + resource + '/' + rec._id;
    if(user === 'admin' || user == rec.owner){
      var upd={};
      upd.verb='PUT';
      upd.description='Update for resource '+ resource + ' with id ' + rec._id;
      upd.href = href;
      rec.update=upd;
      var del={};
      del.verb='DELETE';
      del.href=href;
      del.description='Delete for resource ' + resource + ' with id ' + rec._id;
      rec.remove=del;
    }
    var det={};
    det.verb='GET';
    det.description='Details for resource ' + resource + ' with id ' + rec._id;
    det.href=href;
    rec.details=det;
  }
}


function handlePost(req, res) {
  log('handle post for collection: '+ req.params.collectionName);
  if(req.params.collectionName != 'users'){
    // A valid token is required for posts agaist other resources, since we append the
    // dereived userId from the token to the record
    if(!req.headers['user-token']){
      res.send(406,{msg: 'error: user-token must be set in http header to perform a post against '+
        req.params.collectionName});
      return;
    }
    var user = findUserFromToken(req.headers['user-token']);
    log('**** user: ' + user + ' derived from: ' + req.headers['user-token']);
    if(!user){
      res.send(401, '{error: "Supplied token is no longer valid, retreive a new '+
        'token by /api/users/:id providing a valid username and password"}');
      return;
    }
    req.body.owner=user;
  }
  req.collection.insert(req.body, {}, function(e, results){
    if (e) { res.send(JSON.stringify(e));}else{
      res.send(results);
    }
  });
}

function handleSingleResult(req, res) {
  log('access api with: ' + req.path);
  req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
    if (e) return next(e);
    res.send(result);
  });
}

function handlePut(req, res) {
  if(!req.headers['user-token']){
    res.send(406,{msg: 'error: user-token must be set in http header to perform an update'});
    return;
  }
  // In a real server we should offcourse check that the userToken is valid
  delete req.body._id; // In order to update the record, the _id field may not exist in mongo
  req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, 
      {safe:true, multi:false}, function(e, result){
                                    if (e) res.send(500, e);
                                    else{
                                        res.send( (result===1)?{msg:'success'}:{msg:'error'});
                                    } 
                                });
}

function handleDelete(req, res) {
  if(!req.headers['user-token']){
    res.send(406,{msg: 'error: user-token must be set in http header to perform a delete'});
    return;
  }
  // check if we are deleting an advertiment, if this is the case we should also
  // delete linked images
  if(req.params.collectionName && req.params.collectionName === 'advertisments'){
    delLinkedImages(req.params.id);
  }
  req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
}

function separator(path){ return (-1 === path.lastIndexOf('\\')) ? '/' : '\\';}

function updateAddWithImageObj(adId, image){
  var collection = db.collection('advertisments');
  collection.findOne({_id: collection.id(adId)}, function(e, result){
    if (e) return next(e);
    log('we got a result or...'+ result + ' with adId' + adId);
    if(!result) throw 'no ad found with id ' + adId;
    // Now we add a list of images to the ad
    if(!result.images) result.images = [];
    result.images.push(image);
    // Now we must save the updated object
    delete result._id; // In order to update the record, the _id field may not exist in mongo
    collection.update({_id: collection.id(adId)}, {$set:result}, 
      {safe:true, multi:false}, function(e, result){
                                    if (e) return e;
                                    else{
                                        log('advertisment updated..');
                                    } 
                                });

  });
}


var targetDir=fs.realpathSync('./public/img');
function handleImage(req, res){
  var file=req.files.file;
  var tempPath = file.path;
  var advertId = req.body.advertismentId;
  log('image uploaded to: '+ JSON.stringify(file) + ' with advert id ' + advertId);
  var sep = separator(tempPath);
  var imageId = tempPath.split(sep).pop();
  var newName = targetDir + sep + imageId;
  var image = {contentType: file.type, orgName: file.name
     ,imageId: imageId, advertismentId: advertId, href: '/img/'+imageId};
  fs.rename(tempPath, newName, function(err) {
    if (err) throw err;
     log("Upload completed!");
     updateAddWithImageObj(advertId, image);
  });
  res.send(image);
}


function delLinkedImages(adId){
  // First fetch our ad
  var collection = db.collection('advertisments');
  collection.findOne({_id: collection.id(adId)}, function(e, result){
    if (e) return e;
    if(result && result.images){
      for(var i=0; i<result.images.length; i++){
        delImage(result.images[i].imageId);
      }
    }
  });
}

function delImage(id){
  fs.realpath('./public/img/'+id, function(e, imgFile){
    if(e) return; // Image does not exist
    log('***'+ imgFile);
    fs.unlink(imgFile, function(e){if(e) log('unable to delete: '+ imgFile);});
  });
}

function handleDelImage(req, res){
  if(!req.headers['user-token']){
    res.send(406,{msg: 'error: user-token must be set in http header to perform a delete'});
    return;
  }
  var id = req.params.id;
  delImage(id);
  res.send({sucess: 'image ' + id + ' deleted'});
}


//
// ============================ ROUTES ======================================
//

// This route is used to authenticate a user, it is protected with basic auth 
// and returns a user object including a user_token that can be used for 
// upcoming actions
app.get('/api/users/:id', auth, handleLogin);
app.get('/api/users', accessDenied);
app.post('/api/images',handleImage);
app.del('/api/images/:id', handleDelImage);
app.get('/api/:collectionName', handleListResult);
app.post('/api/:collectionName', handlePost);
app.get('/api/:collectionName/:id', handleSingleResult);
app.put('/api/:collectionName/:id', handlePut);
app.del('/api/:collectionName/:id', handleDelete);

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

console.log('go to http://localhost:3000/api/advertisments');
app.listen(3000);
