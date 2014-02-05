'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('buyAndSellApp.services', [], function($provide) {
  $provide.factory('version', [ function() {
    return '0.1';
  }]);
  $provide.factory('advertisment', ['$http', function(httpSvc){return new advertisment(httpSvc);}]);  
  $provide.factory('user', ['$http', function(httpSvc){return new user(httpSvc);}]);  
});

/*)
  .value('version', '0.1')
  .value('advertisment', new advertisment())
  .value('user', new user());
*/

function user($http){
  var _user={};
  var connFn = function(username, password, res){
      function utf8_to_b64( str ) {return window.btoa(unescape(encodeURIComponent( str )));}
      $http.defaults.headers.common['Authorization'] = 'Basic ' + utf8_to_b64(username + ':' + password);
      $http.get('/api/users/'+ username).success(function(data, status) {
            if (status < 200 || status >= 300)
                return;
            _user = data;
            $http.defaults.headers.common['user-token'] = _user.userToken;
            res(_user);
        }).error(function(err, status, headers, config) {
          if(status == 418){
            res( {error: err});
          }
        });
        delete $http.defaults.headers.common.Authorization;
        
  };
  return{
    register: function(newUser, res) {
        $http.post('/api/users/', newUser).success(function(data, status) {
            _user = data[0];
            // Now we have to call get, to get our token
            connFn(_user.email, _user.password, res);
        }).error(function(err, status, headers, config) {
            return {error: err};
        });
    },
    connect: connFn,
    logout: function(){
      delete $http.defaults.headers.common['user-token'];
    }
  };
}  

function advertisment($http){
  return{
    list: function(){
        return [
                {
                _id: "dummy-client-id1",
                category: "Hobbies",
                created: "2014-02-04T09:27:34.825Z",
                description: "Premium Surf Board",
                images: [
                         {
                         contentType: "image/jpg",
                         advertismentId: "dummy-client-id1",
                         href: "https://raw.github.com/ewernqvi/mvc_rest_demo/master/server/test-data/img/surfboard.jpg"
                         }
                         ],
                owner: "mrx@gmail.com",
                price: "$110"
                },
                {
                _id: "dummy-client-id2",
                category: "Hobbies",
                created: "2014-02-11T09:27:34.825Z",
                description: "Premium Long Board",
                images: [
                         {
                         contentType: "image/jpg",
                         advertismentId: "dummy-client-idr2",
                         href: "https://raw.github.com/ewernqvi/mvc_rest_demo/master/server/test-data/img/longboard.jpg"
                         }
                         ],
                owner: "mrx@gmail.com",
                price: "$220"
                },
                {
                _id: "dummy-client-id3",
                category: "Hobbies",
                created: "2014-02-10T09:27:34.825Z",
                description: "Dr Zoggs Sex Wax",
                images: [
                         {
                         contentType: "image/jpg",
                         advertismentId: "dummy-client-id3",
                         href: "https://raw.github.com/ewernqvi/mvc_rest_demo/master/server/test-data/img/zoggs.jpg"
                         }
                         ],
                owner: "mrx@gmail.com",
                price: "$11"
                }
                ];
          }
  }
}
