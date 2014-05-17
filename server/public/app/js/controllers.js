'use strict';

/* Controllers */

var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope',
                                               function($scope) {
        $scope.advertisments= [
   {
     _id: "dummy-client-id1",
     category: "Hobbies",
     created: "2014-02-14T09:27:34.825Z",
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
    created: "2014-02-14T09:27:34.825Z",
    description: "Premium Long Board",
    images: [
      {
        contentType: "image/jpg",
        advertismentId: "dummy-client-idr2",
        href: "https://raw.github.com/ewernqvi/mvc_rest_demo/master/server/test-data/img/longboard.jpg"
      }
    ],
    owner: "mrx@gmail.com",
    price: "$110"
   },
   {
    _id: "dummy-client-id3",
    category: "Hobbies",
    created: "2014-02-14T09:27:34.825Z",
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
        
  }]);
  
 

  buyAndSellApp.controller('MyCtrl1', [function() {

  }]);
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
