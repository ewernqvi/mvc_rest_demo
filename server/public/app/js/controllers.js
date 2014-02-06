'use strict';

/*Utility functions */
function formatDate(ds){
          var d = new Date(ds);
          var now = new Date();
          var dstr = d.toDateString();
          if(now.toDateString() === dstr) dstr = 'today '+d.toTimeString().split(' ')[0];
          return dstr;
        };

/* Controllers */

var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
        $scope.advertisments = advertisment.list();
        $scope.formatDate = formatDate;
  }]);
  
  
 buyAndSellApp.controller('AdvertismentDetailCtrl',['$scope', '$routeParams', 'advertisment',
                                               function($scope, $routeParams, advertisment) {
        $scope.adId = $routeParams.id;
                $scope.adId = $routeParams.id;
        $scope.advertisment = {};
        // Note that we utilize a promise here, since this will be asyncronous when we later
        // will communicate with the server
        advertisment.get($scope.adId).then(function(res){
           $scope.advertisment = res;
           $scope.currentImage = res.images[0];
        }, function(err){console.log('error: '+ err)});
        
        
        $scope.formatDate = formatDate;
        if(!$scope.advertisment.longDescription)
          $scope.advertisment.longDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla metus magna, consectetur ac dui at, pellentesque adipiscing felis. Nullam consectetur eros lacus, quis sagittis elit molestie eget. Aliquam suscipit malesuada felis et eleifend. Aliquam erat volutpat. Sed ut leo ut felis feugiat sodales imperdiet nec enim. Nunc non placerat odio, sit amet interdum augue. In et laoreet justo.";
        
  }]); 
  
  buyAndSellApp.controller('LoginController', ['$scope', 'user',
     function($scope, user){
        $scope.login = {};
        $scope.login.user = null;
         
        $scope.login.connect = function() {
          user.connect($scope.login.login, $scope.login.password, function(res){
            if(res.error) alert(err);
            $scope.login.user = res;
          });
        }
         
        $scope.login.register = function() {
          var newUser = {email: $scope.login.new.user,
                         password: $scope.login.new.password};
          user.register(newUser, function(res) {
            if(res.error) alert(err);
            $scope.login.user = res;
          });
         };
    
         $scope.login.disconnect = function() {
           $scope.login.user = null;
           user.logout();
         };
     }]);

  buyAndSellApp.controller('MyCtrl1', [function() {

  }]);
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
