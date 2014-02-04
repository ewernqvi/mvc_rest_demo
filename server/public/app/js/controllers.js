'use strict';

/* Controllers */

var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
        $scope.advertisments = advertisment.list();
  }]);

  buyAndSellApp.controller('MyCtrl1', [function() {

  }])
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
