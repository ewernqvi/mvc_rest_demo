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
        var deferred = $q.defer();
        var list= [
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
                deferred.resolve(list);
                return deferred.promise;
  }
  return{
    get: function(adId){
      var deferred = $q.defer();
      var res=null;
      // Dummy implementation for now, we shall call the server
      var l=list();
      for(var i=0; i < l.length; i++){
        if(l[i]._id === adId){
          res = l[i];
          break;
        }
      }
      if(res)
        deferred.resolve(res);
      else
        deferred.reject('Advertisment with id: ' + adId + ' not found!');

      return deferred.promise;

    },
    list: list
  }
}
});
