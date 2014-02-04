'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('buyAndSellApp.services', []).
  value('version', '0.1')
  .value('advertisment', new advertisment());

function advertisment(){
  return{
    list: function(){
        return [
                {
                _id: "dummy-client-id1",
                category: "Hobbies",
                created: "2014-02-14T09:27:34.825Z",
                description: "Premium Surf Board",
                images: [
                         {
                         contentType: "image/jpg",
                         advertismentId: "dummy-client-id1",
                         href: "/test-data/img/surfboard.jpg"
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
                         href: "/test-data/img/longboard.jpg"
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
                         href: "/test-data/img/zoggs.jpg"
                         }
                         ],
                owner: "mrx@gmail.com",
                price: "$11"
                }
                ];
          }
  }
}
