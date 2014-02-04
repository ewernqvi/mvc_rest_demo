'use strict';

/* Controllers */

var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
        $scope.advertisments = advertisment.list();
        $scope.formatDate = function(ds){
          var d = new Date(ds);
          var now = new Date();
          var dstr = d.toDateString();
          if(now.toDateString() === dstr) dstr = 'today '+d.toTimeString().split(' ')[0];
          return dstr;
        };
  }]);
  
  
 buyAndSellApp.controller('AdvertismentDetailCtrl',['$scope', '$routeParams', 'advertisment',
                                               function($scope, $routeParams, advertisment) {
        $scope.adId = $routeParams.id;
        //$scope.advertisment = advertisment.get($scope.adId);
        var text=JSON.stringify(advertisment.list()[0]);
        $scope.advertisment = text;
        $scope.formatDate = function(d){return "today 11:21";};
  }]);  

  buyAndSellApp.controller('MyCtrl1', [function() {

  }]);
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
