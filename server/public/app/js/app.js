'use strict';

// Declare app level module which depends on filters, and services
angular.module('buyAndSellApp', [
  'ngRoute',
  'buyAndSellApp.filters',
  'buyAndSellApp.services',
  'buyAndSellApp.directives',
  'buyAndSellApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/advertisments', {templateUrl: 'partials/advertisments.html', 
      controller: 'AdvertismentsCtrl'});
  // Default route
  $routeProvider.otherwise({redirectTo: '/advertisments'});
}]);
