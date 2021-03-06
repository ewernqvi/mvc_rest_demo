'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  // Test for AdvertismentsCtrl
  describe('AdvertismentsCtrl', function(){
    var scope, ctrl, httpMock;
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $httpBackend) {
      scope = {};
      httpMock = $httpBackend;
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
      httpMock.flush();
      expect(scope.advertisment.description).toBe('test-part');
    });

    it('should set advertisment id', function() {
      httpMock.flush();
      expect(scope.adId).toBe(adId);
    });

    it('should contain function formatDate', function(){
      httpMock.flush();
      expect(typeof scope.formatDate).toBe('function');
    });

  });

  // Test for LoginCtrl
  describe('LoginCtrl', function(){
    var scope, ctrl, httpMock, createController;
    var testUser =  { email: 'test@user', password: 'loko'};
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller, $httpBackend) {
      scope = {};
      httpMock = $httpBackend;
      httpMock.when('GET', "/api/users/test@user").respond(testUser);
      createController = function(){
        return $controller('LoginController', {$scope:scope});
      }
    })); 

     afterEach(function() {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
    });

    it('should not have logged in', function() {
      var controller = createController();
      expect(scope.login.user).toBe(null);
    });

    it('should log in user', function() {
      // Simulate that the user entered the information in the GUI
      httpMock.expectGET('/api/users/test@user');
      var controller = createController();
      scope.login.login = testUser.email;
      scope.login.password = testUser.password;

      scope.login.connect();
      httpMock.flush();
      expect(scope.login.user.password).toBe(testUser.password);
      //httpMock
    });

    it('should logout a logged in user', function() {
      // Simulate that the user entered the information in the GUI
      httpMock.expectGET('/api/users/test@user');
      var controller = createController();
      scope.login.login = testUser.email;
      scope.login.password = testUser.password;

      scope.login.connect();
      httpMock.flush();
      scope.login.disconnect();
      expect(scope.login.user).toBe(null);
    });


  it('should register a user', function() {
      httpMock.expectPOST('/api/users/', testUser).respond(200, [testUser]);
      var controller = createController();
      scope.login.new = {user: testUser.email, password: testUser.password};

      scope.login.register();
      console.log(JSON.stringify(scope));
      httpMock.flush();
      expect(scope.login.user.password).toBe(testUser.password);
      //httpMock
    });

  });// END Login CTRL TEST

});
