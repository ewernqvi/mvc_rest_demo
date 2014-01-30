var superagent = require('superagent');
var expect = require('expect.js');
var fs = require('fs');

describe('express rest api server for demo', function(){
  var id;
  var host='http://localhost:3000/';
  var app='api';
  var login_resource=host + app +'/users/';
  var user_resource=host+app+'/users';
  var image_resource=host+app+'/images';
  var advertisment_resource=host+app+'/advertisments';
  var user_token='';
  var ad_id;
  var img_id1, img_id2;

  var test_user={name: 'Erik Wernqvist', email: 'erik@wernqvist.eu', 
    phone: '0761-284285', _id: 'erik@wernqvist.eu', 
password: 'password', userToken: ''};

//
// Verify that it is possible to create a new user in the system
//
it('user registration', function(done){
  console.log('testing user registration against ' + user_resource  + ' : ' + 
    JSON.stringify(test_user));
  superagent.post(user_resource )
  .send(test_user)
  .end(function(e, res){
    //console.log('apa: '+res.text);
    expect(e).to.eql(null);
    done();
  });
});

//
// Verify that it is possible to get the new user object using email and the 
// supplied password, note that this service should be secured by https, but in 
// this simple demo we use http
//
it('user login', function(done){
  console.log('testing user login against ' + login_resource + test_user.email);
  superagent.get(login_resource + test_user.email).send()
  .auth(test_user.email, test_user.password)
  .end(function(e, res){
    console.log('auth result: ' + e);
    expect(e).to.eql(null);
    expect(res.body._id).to.eql(test_user._id);
    test_user.userToken = res.body.userToken;
    user_token=test_user.userToken;
    expect(res.body).to.eql(test_user);
    done();
  });
});


//
// Update our test user, by updating the password, ensure that a proper user token is required
// to perform the update, shall fail
//
it('ensure that a  user object can not be updated without a token', function(done){
  //delete test_user._id;
  console.log('no-token: update using: ' + login_resource + test_user.email);
  superagent.put(login_resource + test_user.email)
  .send(test_user)
  .end(function(e, res){
    console.log('**update..');
    //for(p in res){
    //    console.log('% '+ p);
    //}
    console.log(res.statusCode);
    expect(e).to.eql(null);
    expect(res.statusCode).to.eql(406);
    done();
  });
});


//
// Update our test user, by updating the password, verify that it's possible to login with the
// new password
//
it('ensure that a  user object can be updated with a valid token', function(done){
  test_user.password='password1';
  console.log('update using: ' + login_resource + test_user.email);
  superagent.put(login_resource + test_user.email)
  .set('user-token', user_token)
  .send(test_user)
  .end(function(e, res){
    console.log('**update..');
    console.log(res.statusCode);
    expect(e).to.eql(null);
    expect(res.statusCode).to.eql(200);
    // ensure that we can login using the new password

    superagent.get(login_resource + test_user.email).send()
    .auth(test_user.email, test_user.password)
    .end(function(e, res){
      console.log('auth result: ' + e);
      expect(e).to.eql(null);
      // Since we switched password we have a new token
      user_token = res.body.userToken;
      test_user.userToken = user_token;
      expect(res.body).to.eql(test_user);
    });
  done();
  });
});

var test_add = {price: '100', description: 'Dr Zoggs Sex Wax', category: 'surfing stuff'};

// Verify that it is possible to create a new advertisment if a user-token is supplied and
// required fields are supplied, not passing required fields shall generate an error message
// and a 403 http-code
it('add advertisment', function(done){
  console.log('testing adding an advertisment ' + advertisment_resource  + ' : ' + JSON.stringify(test_add));
  superagent.post(advertisment_resource )
  .set('user-token', user_token)
  .send(test_add)
  .end(function(e, res){
    console.log('apvert: '+res.text);
    expect(e).to.eql(null);
    ad_id = res.body[0]._id;
    console.log('TODO: check that leaving out required fields lead to an error');
    done();
  });
});

// Verify that it is possible to retreive a list of all advertisments without a token
it('retreive advertisment', function(done){
  console.log('testing retreiving advertisments ' + advertisment_resource );
  superagent.get(advertisment_resource )
  .send()
  .end(function(e, res){
    console.log('apverts: '+res.text);
    expect(e).to.eql(null);
    console.log('TODO: check that we do not get any delete links and at least one resource');
    done();
  });
});

// Verify that it is possible to retreive a filtered list by supplying a filter record
it('retreive advertisment with filter', function(done){
  console.log('testing retreiving advertisments ' + advertisment_resource );
  var filter={};
  filter._id = ad_id;
  var res = advertisment_resource + '?_id=' + ad_id;
  console.log('xx res: '+ res);
  superagent.get(res)
  .send(filter)
  .end(function(e, res){
    console.log('apverts: '+res.text);
    expect(e).to.eql(null);
    expect(res.body.length).to.eql(1);
    console.log('check that we only get back one advert with _id: ' + ad_id);
    done();
  });
});

// Verify that it is possible to retreive a list of all advertisments with a token, and that
// ads owned by the user associated with the token can be deleted, e.g. have a link to the 
// delete method
it('retreive advertisment with user-token, edit and delete links available', function(done){
  console.log('testing retreiving advertisments ' + advertisment_resource );
  superagent.get(advertisment_resource )
  .send()
  .set('user-token', user_token)
  .end(function(e, res){
    console.log('apverts: '+res.text);
    expect(e).to.eql(null);
    for(var i=0; i<res.body.length; i++){
      // check
    }
    done();
  });
});

// Verify that it's possible to update the text of an ad
it('update the text of an advert', function(done){
  test_add.price='200';
  superagent.put(advertisment_resource+'/'+ad_id )
  .send(test_add)
  .set('user-token', user_token)
  .end(function(e, res){
    console.log('updated advert: '+JSON.stringify(res.body));
    expect(e).to.eql(null);
    done();
  });
});


// Verify that it's possible to add images to an add
it('add an image object to an advertisment', function(done){
  var testImg = fs.realpathSync('test/test.png');
  superagent.post(image_resource)
  .attach('file', testImg)
  .field('advertismentId', ad_id)
  .end(function(e, res){
    console.log(res.body);
    img_id1=res.body.imageId;
    // retreive the add to ensure that it has been updated with proper image links
    superagent.get(advertisment_resource+'/'+ad_id).send().end(function(e, res){
      console.log('advertisment shall now contain links to image object...' + res.text);
      expect(res.body.images.length).to.eql(1);
    });
    // Now we add another image, so we have one left when we delete the first image
    superagent.post(image_resource)
    .attach('file', testImg)
    .field('advertismentId', ad_id)
    .end(function(r, res){
      console.log('Image 2 uploaded');
      img_id2=res.body.imageId;
    });
    done();
  });
});

// Verify that it's possible to remove images
it('removes an image object', function(done){
  superagent.del(image_resource +'/'+ img_id1)
  .set('user-token', user_token)
  .end(function(e, res){
    console.log(res.body);
    expect(e).to.eql(null);
    expect(typeof res.body).to.eql('object');
    expect(res.body.sucess).to.eql('image '+img_id1+' deleted');
    done();
  });
});

// Verify that it's possible to remove an advertisment and that linked images are removed.
it('removes an advertisment object', function(done){
  superagent.del(advertisment_resource +'/'+ ad_id)
  .set('user-token', user_token)
  .end(function(e, res){
    console.log(res.body);
    expect(e).to.eql(null);
    expect(typeof res.body).to.eql('object');
    expect(res.body.msg).to.eql('success');  
    // Since we removed the ad, the linked image shall have been removed
    if(img_id2){
      fs.realpath('./public/img/' + img_id2, function(e, res){
        if(!e) expect().fail('image still existst');
      });
    }
    done();
  });
});      

// Verify that it's possible to remove a user  
it('removes a user object', function(done){
  superagent.del(user_resource +'/'+test_user.email)
  .set('user-token', user_token)
  .end(function(e, res){
    console.log(res.body);
    expect(e).to.eql(null);
    expect(typeof res.body).to.eql('object');
    console.log('Del result: ' + res.text);
    expect(res.body.msg).to.eql('success');
    done();
  });
});      
});
