'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){ 
// Test for AdvertismentsCtrl
  describe('AdvertismentsCtrl', function(){
    var scope, ctrl, httpMock;
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $injector) {
      scope = {};
      httpMock = $injector.get('$httpBackend');
      httpMock.expectGET("/api/advertisments").respond([1,3,4]);
      ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
    })); 

    it('should create advertisment model with 3 advertisments', function() {
      httpMock.flush();
      expect(scope.advertisments.length).toBe(3);
      var res = scope.formatDate(new Date());
      //expect(res.match(/today/).index).toBe(0);
    });
  });

  // Test for AdvertismentDetailCtrl
  describe('AdvertismentDetailCtrl', function(){
    var scope, ctrl, httpMock;
    var adId = 'testId';
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $httpBackend, $routeParams) {
      scope = {};
      var route = {};
      httpMock = $httpBackend;
      var d = new Date();
      $routeParams.id = adId;
      httpMock.expectGET("/api/advertisments/testId").respond(
        {_id:adId, created: d, price: '35',description: 'test-part', 
          images: [{a:'a'}]});
      ctrl = $controller('AdvertismentDetailCtrl', {$scope:scope});
    })); 

    it('should return an advertisment', function() {
      if(httpMock && httpMock.flush) {
        console.log('**' + httpMock.flush);
        httpMock.flush();
      }
      else console.log('what the fuck..');
      expect(scope.advertisment.description).toBe('test-part');
    });

    it('should set advertisment id', function() {
      //httpMock.flush();
      expect(scope.adId).toBe(adId);
    });

    it('should contain function formatDate', function(){
      //httpMock.flush();
      expect(typeof scope.formatDate).toBe('function');
    });

  });

});
