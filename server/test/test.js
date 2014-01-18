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
      //.accept('application/json')
      .send(test_user)
      .end(function(e, res){
	 console.log('apa: '+res.text);
	 expect(e).to.eql(null);
	 //expect(res.body.length).to.eql(1);
	 //expect(res.body[0]._id).to.eql(test_user._id);
	 user_token = res.body[0].userToken;
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
	 //console.log('***'+res.text);
	 //console.log('***'+JSON.stringify(res.body));
	 expect(e).to.eql(null);
	 //expect(res.body.length).to.eql(1);
	 //expect(res.body[0]).to.eql(test_user);
	 expect(res.body._id).to.eql(test_user._id);
	 expect(res.body).to.eql(test_user);
	 done();
    });
  });


  //
  // Update our test user, by updating the password, ensure that a proper user token is required
  // to perform the update, shall fail
  //
  it('ensure that a  user object can not be updated without a token', function(done){
    test_user.password='password';
    delete test_user._id;
    console.log('no-token: update using: ' + login_resource + test_user.email);
    superagent.put(login_resource + test_user.email)
      .send(test_user)
      .end(function(e, res){
	      console.log('**update..');
	      for(p in res){
		      console.log('% '+ p);
	      }
	      console.log(res.statusCode);
	      expect(e).to.eql(null);
	      expect(res.statusCode).to.eql(406);
        //expect(typeof res.body).to.eql('object')
        //expect(res.body.msg).to.eql('success')        
	done();
      });
  });

  if('checks an updated object', function(done){
    superagent.get('http://localhost:3000/collections/test/'+id)
      .end(function(e, res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body._id.length).to.eql(24)        
        expect(res.body._id).to.eql(id)        
        expect(res.body.name).to.eql('Peter')        
        done()
      })
  })    
  it('removes an object', function(done){
    superagent.del(user_resource +'/'+test_user.email)
      .end(function(e, res){
        console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.msg).to.eql('success')    
        done()
      }) 
  })      
});
