'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('buyAndSellApp.services', [], function($provide) {
  $provide.factory('version', [ function() {
    return '0.1';
  }]);
  $provide.factory('advertisment', ['$http', '$q', function(httpSvc, q){return new advertisment(httpSvc, q);}]);  
  $provide.factory('user', ['$http', function(httpSvc){return new user(httpSvc);}]);  

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

function advertisment($http, $q){
  function list(){
    // the $http API is based on the deferred/promise APIs exposed by the $q service
    // so it returns a promise for us by default
    return $http.get('/api/advertisments').then(function(response) {
      if (typeof response.data === 'object') {
        return response.data;
      }else{
        // invalid response
        return $q.reject(response.data);
      }
    }, function(err) {
      // something went wrong
      return $q.reject(err.data);
    });
  }
  return{
    get: function(adId){
     return $http.get('/api/advertisments/' + adId).then(function(response) {
      if (typeof response.data === 'object') {
        return response.data;
      }else{
        // invalid response
        return $q.reject(response.data);
      }
    }, function(err) {
      // something went wrong
      return $q.reject(err.data);
    });
      
    },
    list: list
  }
}

});
