MVC REST Demo
=============

#Purpose
The purpose of this repository is to work as a RESTful backend for an MVC style architecure tutorial. The application consists of two parts.

* [REST Server](#server)
* [MVC Client](#client)

# Server
The REST server part of the application has three resources

1. Users
2. Advertisments
3. Images

I will demonstrate typical flows using CURL, it is then up to the MVC client developer to use this for input for the XHR-requests from the browser.

## Installation
To get the server to run on your local system you must install some dependencies

1. Node JS http://nodejs.org/, click on install

   Once installed open a terminal to see if node is working

   ```
node -version
   ```

   When you installed node you also get the node package manager called NPM which we will utlize to get additional node dependencies

2. Mongo DB http://docs.mongodb.org/manual/installation/, follow the instructions for your platform

3. git http://git-scm.com/downloads, follow the instructions for your platform

4. Get the code
   ```
git clone https://github.com/ewernqvi/mvc_rest_demo.git
   ```
5. Install dependencies
   Change direcectory to the server of your downloaded 
   ```
cd mvc_rest_demo/server
npm install -g mocha
npm install
   ```

6. Start mongo db in a separate terminal window
   ```
   mongod
   ```
7. Start the server
   ```
   node express_server
   ```

8. Run the test to see if everything is working, this must be done in a separate teminal window
   ```
   mocha
   ```
9. You are done

## Typical Flows
### User Registration
```
curl -X POST -d '{"email" : "mrx@gmail.com", "password" : "loko"}' \ 
  -H "Content-Type: application/json" http://localhost:3000/api/users
```
If successful, this will return a new user in JSON format, note that depending on where and how you installed your server the URL may differ

### User Logon
Once you have a user in the system, you can use this user to login, which is a requirement for adding new advertisments.
```
curl -X GET -u 'mrx@gmail.com:loko' http://localhost:3000/api/users/mrx@gmail.com
```
Note that the password and username is what you supplied during user registration, we use basic authentication. In a real-world application this resource should be protected by https since we send the password over the wire i base64 encoding. 

If we manage to login we get the following JSON back
```javascript
{
  email: "mrx@gmail.com",
  password: "loko",
  _id: "mrx@gmail.com",
  created: "2014-01-31T08:24:11.066Z",
  userToken: "ovxptw7z8rveipb9eqc04tjsoky5jyvi"
}
```
The important bit, which we must utilize later is the userToken, which we will stick to our http-header to identify ourselves. You may wonder why the server doesn't make this stick by putting it in a cookie, the easy answer is because it isn't restful and since this training is about REST we shall apply the stateless nature of the server.

For now remember your token

### Add a new advertisment
To add a new advertisment, we issue a post, now we need to supply the userToken in the HTTP header for our identification

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi -H "Content-Type:application/json" \
  -d '{"category": "Phone", "description": "IPhone5 - Mint Condtition", "price": "$200"}' \ 
  http://localhost:3000/api/advertisments
```
If successful we get the following JSON back, the important bit is the created _id which we will use later on
```javascript
[
  {
    category: "Phone",
    description: "IPhone5 - Mint Condtition",
    price: "$200",
    owner: "mrx@gmail.com",
    created: "2014-01-31T09:27:34.825Z",
    _id: "52eb6c860e5f433f24000003"
  }
]
```

### Add an image to our advertisment
To make our advertisment more appealing we want to upload an image to the server. Image uploading can be performed in many ways, but when using a http-browser [multi-part form](http://www.ietf.org/rfc/rfc2388.txt) is the norm and the browser handles content-type, size headers etc for you.

When using curl we must include the -F option to tell curl we want to post a file, in this case our image. Since we want to add the image to our advertisment we must also include the advertimenentId as a form parameter

```
curl -F "file=@./iphone.gif" -F "advertismentId=52eb6c860e5f433f24000003" http://localhost:3000/api/images
```
We get back a JSON from the server indicating that our file was sucesfully updated, the important
bit in this JSON is the href to the server generated name of the image

```javascript
{
    contentType: "image/gif",
    orgName: "iphone.gif",
    imageId: "9279-1vopx7g.gif",
    advertismentId: "52eb6c860e5f433f24000003",
    href: "/img/9279-1vopx7g.gif"
}
```
We can add multiple images to our advertisment, if we ask the server for the advertisment now

```
curl http://localhost:3000/api/advertisments/52eb6c860e5f433f24000003
```
We see that the server has updated the advertisment with a link to the added picture

```javascript
{
  _id: "52eb6c860e5f433f24000003",
  category: "Phone",
  created: "2014-01-31T09:27:34.825Z",
  description: "IPhone5 - Mint Condtition",
  images: [
    {
      contentType: "image/gif",
      orgName: "iphone.gif",
      imageId: "9279-1vopx7g.gif",
      advertismentId: "52eb6c860e5f433f24000003",
      href: "/img/9279-1vopx7g.gif"
    }
  ],
  owner: "mrx@gmail.com",
  price: "$200"
}

```

### Browse advertisments in the system
Now we have added an advertisment so we browse it in the system, we will start by not supplying a user-token, e.g. act as a new user who just wants to buy something, this can easily be achieved with a normal web browser, just click on the link or modify it if you run your server on a different location

[http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments)

You will see the JSON formatted as text in the browser window, at least if you run in google Chrome

But there is more, if you supply a user-token in the header, we go back to curl to do this, we now get back links, which are shortcuts for edit, delete and details actions of the resource. These links are typically utlized by a dynamic client, in rest terms we call this [HATEOS](http://en.wikipedia.org/wiki/HATEOAS), which stand for **Hypermedia as the Engine of Application State**. From a REST API perspective this is important, since the linked parts of the API can be considred private, and changes to these parts of the API can be made without having to inform users of the API, that is if they utilized the provided links in their clients and not hardcoding paths.

```
curl http://localhost:3000/api/advertisments -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi
```

JSON output with links
```javascript
[
{
    _id: "52eb6c860e5f433f24000003",
    category: "Phone",
    created: "2014-01-31T09:27:34.825Z",
    description: "IPhone5 - Mint Condtition",
    images: [
      {
        contentType: "image/gif",
        orgName: "iphone.gif",
        imageId: "9279-1vopx7g.gif",
        advertismentId: "52eb6c860e5f433f24000003",
        href: "/img/9279-1vopx7g.gif"
      }
    ],
    owner: "mrx@gmail.com",
    price: "$200",
    update: {
      verb: "PUT",
      description: "Update for resource advertisments with id 52eb6c860e5f433f24000003",
      href: "/api/advertisments/52eb6c860e5f433f24000003"
    },
    remove: {
      verb: "DELETE",
      href: "/api/advertisments/52eb6c860e5f433f24000003",
      description: "Delete for resource advertisments with id 52eb6c860e5f433f24000003"
    },
    details: {
      verb: "GET",
      description: "Details for resource advertisments with id 52eb6c860e5f433f24000003",
      href: "/api/advertisments/52eb6c860e5f433f24000003"
    }
  }
]
```

We get back a list of advertisments, since we have only created one, the list only contains one advertisment. Let's create another advertisment in the system to make it a bit more intresting, for simplicity we will add another phone

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi -H "Content-Type:application/json" \
  -d '{"category": "Phone", "description": "Samsung S3 -  Perfect Condtition", "price": "$200"}' \
  http://localhost:3000/api/advertisments
```

When we look for advertisments now, [http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments) we get two phone backs, but
the API also let's us provide a query, so lets say we only want to search for phones with Samsung in the description we would add the following query parameters to our query

[http://localhost:3000/api/advertisments?category=Phone&description=Samsung](http://localhost:3000/api/advertisments?category=Phone&description=Samsung)

We will only get back the Samsung Phone

## Additional Resource Methods
### Users
1. Delete User
   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/users/:id
   ```
   Set the _token_ and the :id to whatever you want to delete

   Deleting a user also recursively removes all the advertisments added by the user

2. Update User
   ```
curl -X PUT -d '{"email": "email@somewhere.com", "password":"newPwd"}' \
  -H Content-Type:application/json -H user-token:_token_ http://localhost:3000/api/users/:id 
   ```
   Set the _token_ and the :id of the user you want to update, note that you may only update yourself unless you have the administer role. The content passed is a JSON record all the fields of the user. Please note that a HTTP PUT overwrites the entiere record, so all fields must be supplied in the passed record, even the ones you don't change.

### Images
1. Delete an Image

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/image/:id
   ```

   Set the _token_ and the :id to the image you want to delete, deleting an image also removes the link to the the image from the advertisment.

###  Advertisments
1. Update an advertisment text

   ```
curl - X PUT -d '{"price": "200", "category":"Phone", "description": "Brand new Ericsson Phone"}' \
   -H Content-Type:application/json -H user-token:_token_ http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisment you want to update, note that the JSON record shall be complete in a put
2. Delete an advertisment

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisment you want to delete

# Client
This section will cover the actual tutorial of creating a rest client using the [AngularJS](http://www.angularjs.org) framework

## A Static Client
To get an idea what we try to accomplish we startout with a mockup, a static HTML client of our demo. It will be much easier to reason what we want to build if we have seen a prototype.

[static site](http://htmlpreview.github.io/?https://github.com/ewernqvi/mvc_rest_demo/blob/master/server/public/static_site.html)

In the static client we see that we have a rather simple application to display advertisments, it shall also be possible to login and register, once logged in it shall be possible to add new advertisments, and edit and delete these. 
We will convert the application to a dynamic angularjs application step by step, but before we do this just a short intro to the andular JS framework

## Background on Angular JS
The [Angular JS](http://angularjs.org) was created internally within Google in 2009, an engineer named Miško Hevery, he claimed that he could re-write 17 000 lines of front-end code into pure js within two weeks. He almost made the timeline but the amazing effect was that the application now was down to 1500 lines of code, they then knew that they where on to something.

Since 2009 the Angular JS framework has been stabilized and used within several thousand web-sites around the world.

### What is Angular
AngularJS is a structural framework for dynamic web apps. It lets you use HTML as your template language and lets you extend HTML's syntax to express your application's components clearly and succinctly. Out of the box, it eliminates much of the code you currently write through data binding and dependency injection. And it all happens in JavaScript within the browser, making it an ideal partner with any server-side technology.

Angular is what HTML would have been had it been designed for applications. 

The impedance mismatch between dynamic applications and static documents is often solved with:

* a library - a collection of functions which are useful when writing web apps. Your code is in charge and it calls into the library when it sees fit. E.g., jQuery.
* frameworks - a particular implementation of a web application, where your code fills in the details. The framework is in charge and it calls into your code when it needs something app specific. E.g., knockout, ember, etc.

Angular takes another approach. It attempts to minimize the impedance mismatch between document centric HTML and what an application needs by creating new HTML constructs. Angular teaches the browser new syntax through a construct we call directives. Examples include:

* Data binding, as in {{}}.
* DOM control structures for repeating/hiding DOM fragments.
* Support for forms and form validation.
* A complete client-side solution

Angular comes with the following out-of-the-box:

Everything you need to build a CRUD app in a cohesive set: 
* data-binding
* basic templating directives
* form validation
* routing
* deep-linking
* reusable components
* dependency injection

Testability story: 
* unit-testing
* end-to-end testing
* mocks
* test harnesses.

###Angular Sweet Spot
Angular simplifies application development by presenting a higher level of abstraction to the developer. Like any abstraction, it comes at a cost of flexibility. In other words not every app is a good fit for Angular. Angular was built with the CRUD application in mind. Luckily CRUD applications represent the majority of web applications. To understand what Angular is good at, though, it helps to understand when an app is not a good fit for Angular.

###The Zen of Angular
Angular is built around the belief that declarative code is better than imperative when it comes to building UIs and wiring software components together, while imperative code is excellent for expressing business logic.

* It is a very good idea to decouple DOM manipulation from app logic. This dramatically improves the testability of the code.
* It is a really, really good idea to regard app testing as equal in importance to app writing. Testing difficulty is dramatically affected by the way the code is structured.
* It is an excellent idea to decouple the client side of an app from the server side. This allows development work to progress in parallel, and allows for reuse of both sides.
* It is very helpful indeed if the framework guides developers through the entire journey of building an app: 
  * from designing the UI
  * through writing the business logic
  * to testing.
* It is always good to make common tasks trivial and difficult tasks possible.

###Angular frees you from the following pains

* Registering callbacks
* Manipulating HTML DOM programmatically
* Marshaling data to and from the UI- Data Bindingin
* Writing tons of initialization code just to get started

for further information please see http://docs.angularjs.org/guide/introduction

## Developing the Angular JS Client
Now that we have a very brief understanding what Angular JS is all about it's time to see it in action. Angular comes with a starter template, I have prepared this template for our demo application. We will utilze git to fetch the latest version of our code

```
git checkout -f client-angular1
```

We know get a new set of files, but most importantly a working skeleton application that is fully testable and prepared for the tasks to come.

If your node server is not running start it with
```
node express_server.js
```

Once the server has been started it shall be possible to navigate to

[app/index.html](http://localhost:3000/app/index.html)

And you shall see our Angular JS skeleton app with the text Angulars is working 4-ever at the button. If you view the code of [index.html](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/app/index.html) we can see that angular js libaries are loaded and the {{2+2}} at the button is evaluated to a 4 which indicates that it's up and running.

To run the [test](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md) please follow the linked [instructions](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md).

### Migrating our Static Client to Angular JS - Model and Controller
Now when we have been introduced to the starter application, it's time to get useful and migrate our static application to a dynamic angular application. We leave the rest parts behind for now, but create a local mockup repository of our initial data. To do this we first take a look at the JSON format returned by our REST-server

```javascript
{
  _id: "52eb6c860e5f433f24000003",
  category: "Phone",
  created: "2014-01-31T09:27:34.825Z",
  description: "IPhone5 - Mint Condtition",
  images: [
    {
      contentType: "image/gif",
      orgName: "iphone.gif",
      imageId: "9279-1vopx7g.gif",
      advertismentId: "52eb6c860e5f433f24000003",
      href: "/img/9279-1vopx7g.gif"
    }
  ],
  owner: "mrx@gmail.com",
  price: "$200"
}

```

if we take this as template input, and the data from our [static page](https://github.com/ewernqvi/mvc_rest_demo/blob/master/server/public/static_site.html) we could convert the 3 advertisments on the static page to the following JSON

```javascript
[
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
]

```
Let us create a new partial for our list of advertisments, the HTML code for this would be

```HTML
<h2>This is where our list of advertisments shall be displayed</h2>
```
advertisments.html

let us save the file as partials/advertiments.html

Now we must modify the router so it will be aware of our partial
```javascript
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/advertisments', {templateUrl: 'partials/advertisments.html', 
      controller: 'AdvertismentsCtrl'});
  // Default route
  $routeProvider.otherwise({redirectTo: '/advertisments'});
```
[app.js](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/app/js/app.js)

As you probably spotted, we reference a new controller called advertismentsCtrl, lets open up the controllers.js file and add our controller

```javascript
angular.module('buyAndSellApp.controllers', []).
  controller('AdvertismentsCtrl', [function() {
    // We leave this blank for now
  }])
  .controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);
```
[controllers.js](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/app/js/controllers.js)

We deliberity added no code in the controller, since we are test-driven we shall now modify our test to include the new controllerand in the test we shall state the wanted behaviour of our controller, so open up controllersSpec.js to add our new test

```javascript
describe('controllers', function(){
  beforeEach(module('buyAndSellApp.controllers'));

  it('should create advertisment model with 3 advertisments', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AdvertismmentsCtrl', {$scope:scope});
    //Check that the controller has a list of three advertisments
    expect(scope.advertisments.length).toBe(3);
  }));

  it('should ....', inject(function() {
    //spec body
  }));
});
```
[controllersSpec.js](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/test/unit/controllersSpec.js)

Run the unit tests, if it was not started already.

Ensure that the test fails, we have not fixed our controller yet remember!

OK, lets fix the controller
```javascript
angular.module('buyAndSellApp.controllers', []).
  controller('AdvertismentsCtrl', [function() {
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

  }])
```

Rerun our tests, it shall pass now, if it doesn't check your code.

### Adding our Presentation Logic

### Hooking up Angular JS with the REST backend

### Browse Advertisments

### Advertisment Details

### Logging In

### Edit Advertisment Text

### Adding new Advertisments

### Adding Images to Advertisments

## Client Summary

### Adding Images to
