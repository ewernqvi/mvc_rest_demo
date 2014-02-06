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

  it('should ....', inject(function() {
    //spec body
  }));

  it('should ....', inject(function() {
    //spec body
  }));

});
