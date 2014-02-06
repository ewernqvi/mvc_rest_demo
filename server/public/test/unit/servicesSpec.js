'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('buyAndSellApp.services'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });

  describe('advertisment', function() {
    it('should return the advertisment service', inject(function(advertisment) {
      //expect(advertisment.list()).toEqual(3);
      console.log(advertisment.list());
    }));
  });

});
