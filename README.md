MVC REST Demo
=============

#Purpose
The purpose of this repository is to work as a RESTful backend for an MVC style architecure tutorial. 

The purpose of the full application is to serve as a buy and sell site. A customer browse for 
advertisments, if he/she finds one intresting he/she contacts the owner of the advertisment 
through the server.
A user may also register, which gives the user the ability to add advertisments, edit and delete 
his/her added advertisments.

The application consists of two parts. 
* [REST Server](#server)
* [MVC Client](#client)

# Server
The REST server part of the application has three resources

1. Users
2. Advertisments
3. Images

I will demonstrate typical flows using CURL, it is then up to the MVC client developer to use this 
for input for the XHR-requests from the browser.

Please note that windows user need to install a git client with curl built-in, since curl is not 
natively available in windows.

## Installation
To get the server to run on your local system you must install some dependencies

1. Node JS http://nodejs.org/, click on install

   Once installed open a terminal to see if node is working

   ```
node -version
   ```

   When you installed node you also get the node package manager called NPM which we will utlize to 
   get additional node dependencies

2. Mongo DB http://docs.mongodb.org/manual/installation/, follow the instructions for your platform

3. git http://git-scm.com/downloads, follow the instructions for your platform, note that windows 
   users shall use a version where curl also is included 
   [windows installation with curl included](https://msysgit.googlecode.com/files/Git-1.8.5.2-preview20131230.exe)

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
If successful, this will return a new user in JSON format, note that depending on where and how you 
installed your server the URL may differ

### User Logon
Once you have a user in the system, you can use this user to login, which is a requirement for 
adding new advertisments.
```
curl -X GET -u 'mrx@gmail.com:loko' http://localhost:3000/api/users/mrx@gmail.com
```
Note that the password and username is what you supplied during user registration, we use basic 
authentication. In a real-world application this resource should be protected by https since we 
send the password over the wire in base64 encoding. 

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
The important bit, which we must utilize later is the userToken, which we will stick to our 
http-header to identify ourselves. You may wonder why the server doesn't make this stick by putting 
it in a cookie, the easy answer is because it isn't restful and since this training is about REST 
we shall apply the stateless nature of the server.

For now remember your token

### Add a new advertisment
To add a new advertisment, we issue a post, now we need to supply the userToken in the HTTP header 
for our identification

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi -H "Content-Type:application/json" \
  -d '{"category": "Phone", "description": "IPhone5 - Mint Condtition", "price": "$200"}' \ 
  http://localhost:3000/api/advertisments
```
If successful we get the following JSON back, the important bit is the created _id which we will 
use later on
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
To make our advertisment more appealing we want to upload an image to the server. Image uploading 
can be performed in many ways, but when using a http-browser 
[multi-part form](http://www.ietf.org/rfc/rfc2388.txt) is the norm and the browser handles 
content-type, size headers etc for you.

When using curl we must include the -F option to tell curl we want to post a file, in this case our 
image. Since we want to add the image to our advertisment we must also include the advertimenentId 
as a form parameter

```
curl -F "file=@./iphone.gif" -F "advertismentId=52eb6c860e5f433f24000003" http://localhost:3000/api/images
```
We get back a JSON from the server indicating that our file was successfully updated, the important
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
Now we have added an advertisment so we can browse it in the system, we will start by not supplying 
a user-token, e.g. act as a new user who just wants to buy something, this can easily be achieved 
with a normal web browser, just click on the link or modify it if you run your server on a different 
location

[http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments)

You will see the JSON formatted as text in the browser window, at least if you run in google Chrome

But there is more, if you supply a user-token in the header, we go back to curl to do this, we now 
get back links, which are shortcuts for edit, delete and details actions of the resource. These 
links are typically utlized by a dynamic client, in rest terms we call this 
[HATEOAS](http://en.wikipedia.org/wiki/HATEOAS), which stand for **Hypermedia as the Engine of 
Application State**. From a REST API perspective this is important, since the linked parts of the 
API can be considered private, and changes to these parts of the API can be made without having to 
inform users of the API, that is if they utilized the provided links in their clients and not 
hardcoding paths.

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

We get back a list of advertisments, since we have only created one, the list only contains one 
advertisment. Let's create another advertisment in the system to make it a bit more intresting, 
for simplicity we will add another phone

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi -H "Content-Type:application/json" \
  -d '{"category": "Phone", "description": "Samsung S3 -  Perfect Condtition", "price": "$200"}' \
  http://localhost:3000/api/advertisments
```

When we look for advertisments now, [http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments) 
we get two phone backs, but the API also let's us provide a query, so lets say we only want to 
search for phones with Samsung in the description we would add the following query parameters to 
our query

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
   Set the _token_ and the :id of the user you want to update, note that you may only update yourself 
   unless you have the administer role. The content passed is a JSON record all the fields of the user. 
   Please note that a HTTP PUT overwrites the entiere record, so all fields must be supplied in the 
   passed record, even the ones you don't change.

### Images
1. Delete an Image

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/image/:id
   ```

   Set the _token_ and the :id to the image you want to delete, deleting an image also removes the 
   link to the the image from the advertisment.

###  Advertisments
1. Update an advertisment text

   ```
curl - X PUT -d '{"price": "200", "category":"Phone", "description": "Brand new Ericsson Phone"}' \
   -H Content-Type:application/json -H user-token:_token_ http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisment you want to update, note that the JSON record 
   shall be complete in a put
2. Delete an advertisment

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisment you want to delete

# Client
This section will cover the actual tutorial of creating a rest client using the 
[AngularJS](http://www.angularjs.org) framework

## A Static Client
To get an idea what we try to accomplish we startout with a mockup, a static HTML client of our demo. 
It will be much easier to reason what we want to build if we have seen a prototype.

[static site](http://htmlpreview.github.io/?https://github.com/ewernqvi/mvc_rest_demo/blob/master/server/public/static_site.html)

In the static client we see that we have a rather simple application to display advertisments, 
it shall also be possible to login and register, once logged in it shall be possible to add new 
advertisments, and edit and delete these. 
We will convert the application to a dynamic angularjs application step by step, but before we do 
this just a short intro to the andular JS framework

## Background on Angular JS
The [Angular JS](http://angularjs.org) was created internally within Google in 2009, an engineer 
named Miško Hevery, he claimed that he could re-write 17 000 lines of front-end code into pure js 
within two weeks. He almost made the timeline but the amazing effect was that the application now 
was down to 1500 lines of code, they then knew that they where on to something.

Since 2009 the Angular JS framework has been stabilized and is used within several thousand web-sites 
around the world.

### What is Angular
AngularJS is a structural framework for dynamic web apps. It lets you use HTML as your template 
language and lets you extend HTML's syntax to express your application's components clearly and 
succinctly. Out of the box, it eliminates much of the code you currently write through data binding 
and dependency injection. And it all happens in JavaScript within the browser, making it an ideal 
partner with any server-side technology.

Angular is what HTML would have been had it been designed for applications. 

The impedance mismatch between dynamic applications and static documents is often solved with:

* A library - a collection of functions which are useful when writing web apps. Your code is in 
  charge and it calls into the library when it sees fit. E.g., jQuery.
* Frameworks - a particular implementation of a web application, where your code fills in the details. 
  The framework is in charge and it calls into your code when it needs something app specific. 
  E.g., knockout, ember, etc.

Angular takes another approach. It attempts to minimize the impedance mismatch between document 
centric HTML and what an application needs by creating new HTML constructs. Angular teaches the 
browser new syntax through a construct we call directives. Examples include:

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
Angular simplifies application development by presenting a higher level of abstraction to the developer. 
Like any abstraction, it comes at a cost of flexibility. In other words not every app is a good fit 
for Angular. Angular was built with the CRUD application in mind. Luckily CRUD applications represent 
the majority of web applications. To understand what Angular is good at, though, it helps to 
understand when an app is not a good fit for Angular.

###The Zen of Angular
Angular is built around the belief that declarative code is better than imperative when it comes to 
building UIs and wiring software components together, while imperative code is excellent for 
expressing business logic.

* It is a very good idea to decouple DOM manipulation from app logic. This dramatically improves 
  the testability of the code.
* It is a really, really good idea to regard app testing as equal in importance to app writing. 
  Testing difficulty is dramatically affected by the way the code is structured.
* It is an excellent idea to decouple the client side of an app from the server side. This allows 
  development work to progress in parallel, and allows for reuse of both sides.
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

for further information please see 
* [Angular JS Introduction](http://docs.angularjs.org/guide/introduction)
* [Angular JS API](http://docs.angularjs.org/api)
* [Ten Top Reasons Why to use Angular JS](http://www.sitepoint.com/10-reasons-use-angularjs/)

## Developing the Angular JS Client
Now that we have a very brief understanding what Angular JS is all about it's time to see it in 
action. Angular comes with a starter template, I have prepared this template for our demo application. 
We will utilze git to fetch the latest version of our code

```
git checkout -f client-angular1
```

We know get a new set of files, but most importantly a working skeleton application that is fully 
testable and prepared for the tasks to come.

If your node server is not running start it with
```
node express_server.js
```

Once the server has been started it shall be possible to navigate to

[app/index.html](http://localhost:3000/app/index.html)

And you shall see our Angular JS skeleton app with the text Angulars is working 4-ever at the button. 
If you view the code of [index.html](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/app/index.html) 
we can see that angular js libaries are loaded and the {{2+2}} at the button is evaluated to a 4 
which indicates that it's up and running.

To run the [test](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md) 
please follow the linked [instructions](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md).

### Migrating our Static Client to Angular JS - Model and Controller
Now when we have been introduced to the starter application, it's time to get useful and migrate our 
static application to a dynamic angular application. We leave the rest parts behind for now, but 
create a local mockup repository of our initial data. To do this we first take a look at the JSON 
format returned by our REST-server

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

if we take this as template input, and the data from our 
[static page](https://github.com/ewernqvi/mvc_rest_demo/blob/master/server/public/static_site.html) 
we could convert the 3 advertisments on the static page to the following JSON

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

As you probably spotted, we reference a new controller called advertismentsCtrl, lets open up the 
controllers.js file and add our controller

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

We deliberity added no code in the controller, since we are test-driven we shall now modify our 
test to include the new controllerand in the test we shall state the wanted behaviour of our 
controller, so open up controllersSpec.js to add our new test

```javascript
describe('controllers', function(){
  beforeEach(module('buyAndSellApp.controllers'));

  it('should create advertisment model with 3 advertisments', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
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
  controller('AdvertismentsCtrl', ['$scope', function($scope) {
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

  }])
```
Note that we use an array to define the function body, this is to ensure that the code can be 
minified with the angular dependency injection still working, 
see also [angular minification](http://docs.angularjs.org/guide/di)

Rerun our tests, it shall pass now, if it doesn't check your code.

### Adding our Presentation Logic
Before we add the presentation logic, I will try to explain what actually happens within our 
Angular application, this is probably best done with a picture.

![alt Angular Image](https://raw.github.com/ewernqvi/mvc_rest_demo/master/pres/angular-overview.png)

Angualar applications consist of a Model View and Controller architecutre, but what actually happens 
in our application is that in index.html the ng-app directive is loaded which basically tells Angular 
to take control.

Witin our application, which is a Single Page Application, we have the ability to present partials 
within the page, these will be swapped in and out depending on our actions.

In our first example we load the partial advertisments.html which will contain a div with a 
controller, which is responsible for the scope. In our case we loop over the advertisments array 
with a [ng-repeat](http://docs.angularjs.org/api/ng.directive:ngRepeat) directive. This let us create 
rows in our table.The image has a special [ng-src](http://docs.angularjs.org/api/ng.directive:ngSrc) 
directive since we want databining later on, e.g. if we switch images it should be automatically 
reflected in the view through angulars two-way data binding.

Before we dive into our presentation logic a small refactoring of our application is needed, 
remember that we put an array of test-data directly into our controller, this is poor design so we 
will introduce a new angular feauture called a 
[service](http://docs.angularjs.org/guide/dev_guide.services.understanding_services) where we will 
place this logic.

#### Angular JS Service
If you managed to get the code working in the previous section, you can continue with that code-base
if not you can check out a working version from the previous section

```
git checkout -f client-angular2
```

We start out by modifying our test and then implement a simple stub for our servicer. 

```javascript
  // add the following test
  describe('advertisment', function() {
    it('should return the advertisment service', inject(function(advertisment) {
      expect(advertisment.list().length).toEqual(3);
    }));
  });
```
test/unit/servicesSpec.js

Then we must inform Angular DI that we have a new service available for the application

```javascript
// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('buyAndSellApp.services', []).
  value('version', '0.1')
  .value('advertisment', new advertisment());

function advertisment(){
  return{
    list: function(){
            return [];
          }
  }
}
```
app/js/services.js

Running the test now shall result in a failure, since we havnt't moved the array contents yet.

Now modify our AdvertimentCtrl to call the service, move the array to our advertisment service.

```javascript
var buyAndSellApp = angular.module('buyAndSellApp.controllers', []);
 // To ensure that minification works we must declare injection
 // in an array like manner, get use to it to avoid minification bugs
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
        $scope.advertisments = advertisment.list();
  }]);

  buyAndSellApp.controller('MyCtrl1', [function() {

  }])
  buyAndSellApp.controller('MyCtrl2', [function() {

  }]);
```
app/js/controllers.js

Note that we added our service as an injection parameter, then we simply delegate to the service to
set our scope variable. Did you remember to move the array into the service?

run the test if it's not started, it shall pass now

```
karma start config/karma.conf.js --single-run
```

#### Partial HTML Code -- Advertisments
Now lets edit our partial and add the following html-code

```HTML
<div class="container">
  <table class="table">
    <tbody>
      <!-- dyn content begin -->
      <tr ng-repeat="ad in advertisments">
         <td>
            <a href="#/advertisment/{{ad._id}}"><img ng-src="{{ad.images[0].href}}" class="img-thumbnail"></a>
         </td>
         <td>
            <div>{{formatDate(ad.created)}}</div>
            <div><a href="#/advertisment/{{ad._id}}"><h2>{{ad.description}}</h2></a></div>
            <div><h3>{{ad.price}}</h3></div>
         </td>
      </tr>
    </tbody>
  </table>
</div> <!-- /container -->
```

As you may see we create links to render details in a separate view, we will implement this later,
for now the links will not work. We also added reference to a function


### Hooking up Angular JS with the REST backend

#### Advertisment Details

Create a new advertismentDetails partial

```HTML
<h1>Advertisment Details</h1>
```
partials/advertismentDetails.html

Nothing fancy here, just a simple HTML page displaying all the images for the advertisment and the
detailded description of the advertisment.

```javascript
TODO: insert js code
```
js/app.js

Here we just add the routing logic, the route is triggered by in the adverisments.html partial, which
we have already completed. The new route refers to a new controller which we must implement.

```javascript
TODO: insert js code
```
test/unit/controllersSpec.js

Our new advertismentDetail controller test, at this stage the test will fail, since we have not 
created the controller yet.

```javascript
TODO: insert js code
```
js/controllers.js

When adding the controller logic, we realize that we need a new method in our advertisment service 
to communicate with the advertisment-resource on the server-side. Since we at this instance do not
have more details when getting a single resource, we simply pick out the correct resource from the
exisitng list method.

```javascript
TODO: insert js code
```
js/services.js

Now we have created a working detail page, but as an exercise for you modify the advertisment.get 
method to communicate with the backend.

### Logging In

Create a new login partial, set a variable in the root scope or local storage holding the user-token

```HTML
<h1>Login</h1>
```
partials/login.html

Nothing fancy here, just a simple form divided into a login section and a register new user section.
Submitting the form will trigger a controller and if successful login the user will be transferred
back to the advertisments overview. When an existing user has checked in, the loaded list of 
advertisments are checked against the owner-id, if one matches the data is re-loaded.

```javascript
TODO: insert js code
```
js/app.js

Here we just add the routing logic, the route is triggered by the login button on the index.html page.

```javascript
TODO: insert js code
```
test/unit/controllersSpec.js

Our new login controller test at this stage the test will fail, since we have not created the controller
yet.

```javascript
TODO: insert js code
```
js/controllers.js

When adding the controller logic, we realize that we need a login service to communicate with the 
user-resource on the server-side. We mock this service in our test to make it work without depending
on the backend.

```javascript
TODO: insert js code
```
js/services.js

When we have added our service we shall be able to login, we still have not handled login-errors
and registration errors in a good way, we leave this as an exercise for you!.

### Ordering our displayed advertisments
[Order By](http://docs.angularjs.org/api/ng.filter:orderBy)

## Client Summary
We have now completed part of our application, now it's just a matter of applying the same technique
to finish the reminder of the application or start a new project of your own.
# Extras 
## Server
Modify the server to support CORS, this is rather simple just follow the linked 
[instructions](https://npmjs.org/package/cors)

Make sure you configures the Access-Control-Allow-Headers CORS property to allow our user-token header.

Modify the port of the  server and start an additional instance, let the first server serve your 
HTML-pages this way the REST-API is on a different domain from a web-browser perspective.

e.g. access the client on http://localhost:3333/app

and the server-rest-api on http://localhost:3000/api/advertisments

## Client
### Adding Images in Angular JS
Adding an image to an advertisment is not that hard if we post a form, but in our single page application
we do not want to do this, so instead we must rely on posting FormData in our advertisment service.

see [Simple Example](http://jsfiddle.net/JeJenny/ZG9re/)

There are many more advanced plugins available for Angular if you prefer drag and drop, preview etc.

### Adding new Advertisments
If the user is logged in, just:

1. Add a link at buttom of the page to trigger this route 
2. Update js/app.js with the new route and a controller
3. Add a test and the new controller
4. Add an addAdvertisment.html partial where you display the information in a form, use what you learned
   in the [Adding Images in Angular JS](#Adding Images in Angular JS) to enable adding images, 
   removing an image is just a matter of calling the DELETE method on the image resource. Note that
   you must add a placeholder advertisment to be able to add an image.
5. Add methods in our advertisment service to communicate with
   * POST /api/images - Add image
   * POST /api/advertisments - Add a advertisment

Good Luck!

### Edit Advertisment Text
If the user is logged in, just:

1. Add an edit icon on the left of an advertisment with an edit link
2. Clicking on the icon shall trigger the edit route
3. Update js/app.js with the new route and a controller
4. Add a test and the new controller
5. Add a editAdvertisment.html partial where you display the information in a form
   Removing an image is just a matter of calling the DELETE method on the image resource.
6. Add methods in our advertisment service to communicate with
   * DELETE /api/images:id - Remove an image
   * PUT /api/advertisments - Update the text of the advertisment

Good Luck!
### Removing Advertisments from the Client
Add a wast-bin right of the advertisment, if a delete link exist for the advertisment. When clicked
use the verb and href provided in the link to perform a delete on the server-side.

### Add filtering for Advertiments both on text in description and category
You can do this in two ways, either on the client-side only, then angular does this for you, but this
requires that you have a site with a limited number of advertisments, for show you may try it out it
is barely no coding required

[Angular Search Filter](http://docs.angularjs.org/api/ng.filter:filter)

Add the filter attributes to ng-repeat

If you want to do this properly you shall forward the filter to REST-API on the server, this is just
a matter of adding query parameters to the url for the list service
