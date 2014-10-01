'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  // our controller
  describe('AdvertismentsCtrl', function(){
    var scope, ctrl;
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller) {
      scope = {};
      ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
    })); 

    it('should create advertisment model with 3 advertisments', function($controller) {
      //Check that the controller has a list of three advertisments
      expect(scope.advertisments.length).toBe(3);
    })
  });

   // Test for AdvertismentDetailCtrl
  describe('AdvertismentDetailCtrl', function(){
    var scope, ctrl, httpMock;
    var adId = 'dummy-client-id3';
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $httpBackend, $routeParams) {
      scope = {};
      var route = {};
      httpMock = $httpBackend;
      var d = new Date();
      $routeParams.id = adId;
      ctrl = $controller('AdvertismentDetailCtrl', {$scope:scope});
    })); 

    it('should return an advertisment', inject(function($q, $rootScope) {
      // make angular resolve the promise
      $rootScope.$apply();
      console.log(JSON.stringify(scope.advertisment));
      expect(scope.advertisment.description).toBe('Dr Zoggs Sex Wax');
    }));

    it('should set advertisment id', function() {
      expect(scope.adId).toBe(adId);
    });

    it('should contain function formatDate', function(){
      expect(typeof scope.formatDate).toBe('function');
    });

  });

  it('should ....', inject(function() {
    //spec body
  }));

  it('should ....', inject(function() {
    //spec body
  }));

});
