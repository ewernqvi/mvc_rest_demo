var fs=require('fs');

var log = function(msg){
    console.log(msg);
}

/**
 * Sample test database, should have db.collection and the 
 * collection shall have 
 *  findOne
 *  find
 *  insert
 *  update
 *  remove
 */
var db = {
      collection: function(name){
        return {
          findOne: function(id){log(name + ' find by id: '+ id);},
          find: function(){log(name + ' find all');},
          insert: function(rec){log(name + ' insert ' + JSON.stringify(rec));},
          update: function(rec){log(name + ' update ' + JSON.stringify(rec));},
          remove: function(id){log(name + ' remove by id: '+ id);}
        };
      }
    };

/**
 * Simple decoupling of routes logic, in a real application
 * you would likely have one directory for routes and within 
 * that directory one file per route to make it more modular
 */
module.exports.routes = function (pdb, plog){
  if(plog) log=plog;
  if(pdb) db=pdb;
  return {
    /**
     * Authenticate user, called from express.js
     */
    auth: function (user, pass, callback) {
       var user_db = db.collection('users');
       user_db.findOne({_id: user}, function(e, result){ 
         if (e) return next(e); 
         var authenticated = ( result && result.password && pass === result.password);
         //callback(null /* error */, authenticated);
         callback(authenticated);
      });
    },
    /**
     * Login handler, ensure that a token is set and returned
     */
    handleLogin: handleLogin,
    /**
     * Generic blocker for a route or verb that should not be used
     */
    accessDenied: accessDenied,
    /**
     * Handle upload of image, store on disk, then update advert with
     * link to image
     */
    handleImage: handleImage,
    /**
     * Delete an image resource, the route is protected and requires
     * a token
     */
    handleDelImage: handleDelImage,
    /**
     * Generic function to handle get against a resource list, will
     * return a list. The route gives additional links if a valid 
     * user-token is supplied
     */
    handleListResult: handleListResult,
    /**
     * Generic insert function against a resource, a user-token
     * header must be supplied, the token is received in handleLogin
     */
    handlePost: handlePost,
    /**
     * Generic function to fetch by id from a given resource
     */
    handleSingleResult: handleSingleResult,
    /**
     * Generic update function, protected by user-token
     */
    handlePut: handlePut,
    /**
     * Generic delete function, protected by user-token
     */
    handleDelete: handleDelete,
      
    // Add your public functions above
    sample: fn1
  };
}

function fn1(){
  console.log('sample  do nothing route using db: '+ db);
}

var userTokens = [];

function getClientIP(req){
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    log(ip);
    return ip;
}

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
                           if(result){
                             userTokens[id] = token();
                             result.userToken = userTokens[id];
                             res.send(result);
                           }else{
                             res.send(406, '{error: "Access Denied"}');
                           }
                           });
}

function accessDenied(req, res){
    res.send(406, '{error: "Access Denied"}');
}

function setupSearchFilter(query, collection){
  // The query record are all records sent in the request, these are plain
  // strings and must be converted to regular expressions or an id
  // object if we will search for id
  var res={};
  for(key in query){
    if(key === '_id'){
      res[key] = collection.id(query[key]);
    }else if(key.toString().match(/escription/)){
      res[key] = new RegExp(query[key])
    }else{
      // exact match
      res[key] = query[key];
    }
  }
  return res;
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
    var filter=setupSearchFilter(req.query, req.collection);
    req.collection.find(filter).toArray(function(e, results){
             if (e) { console.log('#### Mongo err: ' + e); res.send(500, e)};
             if (req.params.collectionName)
                 appendLinks2Result(results, user, req.params.collectionName);
             res.send(results);
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
    }else{
      if(!req.body.email || !req.body.password){
        res.send(401, '{error: "You must supply a valid email and password in order to register a new user"}');
      }
      if(!req.body._id){req.body._id=req.body.email;}
    }
    req.body.created = new Date();
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
    req.body.modified=new Date();
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

