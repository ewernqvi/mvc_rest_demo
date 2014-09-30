'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('buyAndSellApp.services', []).
  value('version', '0.1')
  .value('advertisment', new advertisment());

function advertisment(){
  // Insert service logic here
}
