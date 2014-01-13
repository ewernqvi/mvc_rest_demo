var superagent = require('superagent')
var expect = require('expect.js')

describe('express rest api server for demo', function(){
  var id;
  var host='http://localhost:3000/';
  var app='api';
  var user_resource=host+app+'/users';
  var image_resource=host+app+'/images';
  var advertisment_resource=host+app+'/advertisments';
  var user_token='';

  var test_user={name: 'Erik Wernqvist', email: 'erik@wernqvist.eu', phone: '0761-284285', _id: '', password: 'pokoloko'};

  //
  // Verify that it is possible to create a new user in the system
  //
  if('user registration', function(done){
     superagent.post(user_resource).send(test_user)
      .end(function(e, res){
	 console.log(res.body);
	 expect(e).to.eql(null);
	 expect(res.body.length).to.eql(1);
	 expect(res.body[0]._id.length).to.eql(24);
	 test_user._id = res.body[0]._id;
	 user_token = res.body[0].userToken;
	 done();
    });
  });

  //
  // Verify that it is possible to get the new user object using email and the supplied password, note that this
  // service should be secured by https, but in this simple demo we use http, we use post not to expose the password
  // in the url
  //
  if('user login', function(done){
     superagent.post(user_resource+ '/' + test_user.email).send(test_user.password)
      .end(function(e, res){
	 console.log(res.body);
	 expect(e).to.eql(null);
	 expect(res.body.length).to.eql(1);
	 expect(res.body[0]).to.eql(test_user);
	 done();
    });
  });


  it('post object', function(done){
    superagent.post('http://localhost:3000/collections/test')
      .send({ name: 'John'
        , email: 'john@rpjs.co'
      })
      .end(function(e,res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(res.body.length).to.eql(1)
        expect(res.body[0]._id.length).to.eql(24)
        id = res.body[0]._id
        done()
      })    
  });

  it('retrieves an object', function(done){
    superagent.get('http://localhost:3000/collections/test/'+id)
      .end(function(e, res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body._id.length).to.eql(24)        
        expect(res.body._id).to.eql(id)        
        done()
      })
  })

  it('retrieves a collection', function(done){
    superagent.get('http://localhost:3000/collections/test')
      .end(function(e, res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(res.body.length).to.be.above(0)
        expect(res.body.map(function (item){return item._id})).to.contain(id)        
        done()
      })
  })

  it('updates an object', function(done){
    superagent.put('http://localhost:3000/collections/test/'+id)
      .send({name: 'Peter'
        , email: 'peter@yahoo.com'})
      .end(function(e, res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.msg).to.eql('success')        
        done()
      })
  })

  it('checks an updated object', function(done){
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
    superagent.del('http://localhost:3000/collections/test/'+id)
      .end(function(e, res){
        // console.log(res.body)
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.msg).to.eql('success')    
        done()
      }) 
  })      
})
