'use strict';

/* Controllers */


var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
      $scope.advertisments = advertisment.list();
  }]);

buyAndSellApp.controller('AdvertismentDetailCtrl',[ '$scope','$routeParams', 'advertisment',
                                               function( scope, $routeParams, advertisment) {
        var self=scope;
        self.adId = $routeParams.id;
        self.adId = $routeParams.id;
        self.advertisment = {};
        // Note that we utilize a promise here, since this will be asynchronous
        // when we later will communicate with the server
        advertisment.get(self.adId).then(function(res){
           self.advertisment = res;
           self.currentImage = res.images[0];
        }, function(err){console.log('error: '+ err)});

        self.formatDate = function(d){};
  }]);

  buyAndSellApp.controller('MyCtrl1', [function() {

  }]);
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
