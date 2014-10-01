'use strict';

// inject service dependencies, while we are at it we inject the $http service
angular.module('buyAndSellApp.services', [], function($provide) {
  $provide.factory('version', [ function() {
    return '0.1';
  }]);
  $provide.factory('advertisment', ['$http', '$q', function(httpSvc, q){
    return new advertisment(httpSvc, q);
  }]);  

  function advertisment($http, $q){
    function list(){
      // the $http API is based on the deferred/promise APIs exposed by the $q service
      // so it returns a promise for us by default
      return $http.get('/api/advertisments')
         .then(function(response) {
           if (typeof response.data === 'object') {
              return response.data;
           } else {
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
