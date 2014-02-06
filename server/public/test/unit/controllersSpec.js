'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  // our controller
  describe('AdvertismentsCtrl', function(){
    var scope, ctrl, httpMock;
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $httpBackend) {
      scope = {};
      httpMock = $httpBackend;
      httpMock.expectGET("/api/advertisments").respond([1,3,4]);
      ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
    })); 

    it('should create advertisment model with 3 advertisments', function($controller, advertisment) {
      //Check that the controller has a list of three advertisments
      httpMock.flush();
      expect(scope.advertisments.length).toBe(3);
    })
  });

  it('should ....', inject(function() {
    //spec body
  }));

  it('should ....', inject(function() {
    //spec body
  }));

});
