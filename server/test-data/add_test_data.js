var superagent = require('superagent');
var fs = require('fs');
var Q = require('q');

var host='http://localhost:3000/';
var app='api';
var login_resource=host + app +'/users/';
var user_resource=host+app+'/users';
var image_resource=host+app+'/images';
var advertisment_resource=host+app+'/advertisments';
var user_token='';

var img_mac   = 'test/img/mac_bild.jpg';
var img_bike  = 'test/img/cykel.jpg';
var img_board = 'test/img/slalom_skate.jpg';
var img_wax   = 'test/img/zoggs.jpg';

var img_id1, img_id2;

var test_user1={name: 'Joe Doe', email: 'joe@nobody.org', phone: '0761-1234563', _id: 'joe@nodody.org', password: 'pwd'};
var test_user2={name: 'Jane Doe', email: 'jane@nobody.org', phone: '0761-1234563', _id: 'jane@nodody.org', password: 'pwd'};

function genericCB(e, res){
  if(e) console.log('Error: '+ e);
  //console.log(res);
}

function addImage2Add(img, adId){
   var testImg = fs.realpathSync(img);
   superagent.post(image_resource)
   .attach('file', testImg)
   .field('advertismentId', adId)
   .end(function(e, res){
     console.log('image added' + res.text);
   });
}

function login(user){
  var deferred = Q.defer();
  // login as our first user to get a token
  superagent.get(user_resource + '/' + user._id).auth(user._id, user.password).end(deferred.resolve);
  return deferred.promise;
}
function addTestData(test_adv1){
  var deferred = Q.defer();
  console.log('user-token: '+ user_token);
  superagent.post(advertisment_resource).set('user-token', user_token).send(test_adv1)
    .end(deferred.resolve);
  return deferred.promise;
}

//
//Create our test users
//
superagent.post(user_resource).send(test_user1).end(genericCB);
superagent.post(user_resource).send(test_user2).end(genericCB);


login(test_user1).then(function (res){
    user_token = res.body.userToken;
    var test_adv1={
       price:'2350',
       description:'Mac Book Pro - Mint Condition',
       longDescription:'A rather great computer from 2011 at a very reasonable price',
       category:'Computer'
    };

    addTestData(test_adv1).then(function (res){
      console.log('**** ' + res.text + ' *** ' + res.body._id);
      addImage2Add(img_mac,res.body._id);
    });
    var test_adv2={
       price:'23',
       description:'Dr Zoggs Sex Wax - Vanilla',
       longDescription:'The number one wax for your stick, smells vanilla',
       category:'Hobbies : Surf'
    };

    addTestData(test_adv2).then(function (res){
      addImage2Add(img_wax,res.body._id);
    });
});

