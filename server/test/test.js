var superagent = require('superagent')
var expect = require('expect.js')

describe('express rest api server for demo', function(){
  var id;
  var host='http://localhost:3000/';
  var app='api';
  var login_resource=host + app +'/users/';
  var user_resource=host+app+'/users';
  var image_resource=host+app+'/images';
  var advertisment_resource=host+app+'/advertisments';
  var user_token='';

  var test_user={name: 'Erik Wernqvist', email: 'erik@wernqvist.eu', phone: '0761-284285', _id: 'erik@wernqvist.eu', password: 'password', userToken: ''};

  //
  // Verify that it is possible to create a new user in the system
  //
  it('user registration', function(done){
     console.log('testing user registration against ' + user_resource  + ' : ' + JSON.stringify(test_user));
     superagent.post(user_resource )
      .send(test_user)
      .end(function(e, res){
	 //console.log('apa: '+res.text);
	 expect(e).to.eql(null);
	 done();
    });
  });

  //
  // Verify that it is possible to get the new user object using email and the supplied password, note that this
  // service should be secured by https, but in this simple demo we use http, we use post not to expose the password
  // in the url
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
	 expect(res.body).to.eql(test_user);
       });
        done();
      });
  });

  // Verify that it is possible to create a new advertisment if a user-token is supplied and
  // required fields are supplied, not passing required fields shall generate an error message
  // and a 403 http-code

  // Verify that it is possible to retreive a list of all advertisments without a token

  // Verify that it is possible to retreive a list of all advertisments with a token, and that
  // ads owned by the user associated with the token can be deleted, e.g. have a link to the 
  // delete method

  // Verify that it's possible to update the text of an ad

  // Verify that it's possible to add images to an add

  // Verify that it's possible to remove images

  // Verify that it's possible to remove an advertisment and that linked images are removed.

// Verify that it's possible to remove a user  
it('removes an object', function(done){
  console.log('****'+ test_user.userToken);
    superagent.del(user_resource +'/'+test_user.email)
	  .set('user-token', user_token)
      .end(function(e, res){
        console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.msg).to.eql('success')    
        done()
      }) 
  })      
});
