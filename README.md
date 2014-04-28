MVC REST Demo
=============

#Purpose
The purpose of this repository is to work as a RESTful backend for an MVC style
architecture tutorial.

The purpose of the full application is to serve as a buy and sell site. A
customer browse for advertisements, if he/she finds one interesting he/she
contacts the owner of the advertisement through the server.
A user may also register, which gives the user the ability to add advertisements,
edit and delete his/her added advertisements.

The application consists of two parts.
* [REST Server](#server)
* [MVC Client](#client)

# Server
The REST server part of the application has three resources

1. Users
2. Advertisements
3. Images

## Table of Contents Server
- [Installation](#server-installation)
- [Typical Flows](#typical-flows)
  - [User Registration](#user-registration)
  - [User Logon](#user-logon)
  - [Add a new advertisement](#add-a-new-advertisement)
  - [Add an image to our advertisement](#add-an-image-to-our-advertisement)
  - [Browse advertisements in the system](#browse-advertisements-in-the-system)
- [Additional Resource Methods](#additional-resource-methods)
   - [Users](#users)
   - [Images](#images)
   - [Advertisements](#advertisements)



## Server Installation
Please note that windows user shall install the [cygwin package](http://www.cygwin.com/setup-x86_64.exe).since curl in native windows and json input do not work without escaping all "-signs

To get the server to run on your local system you must install some dependencies

1. Node JS http://nodejs.org/, click on install

   Once installed open a terminal to see if node is working

   ```
node --version
   ```
   When you installed node you also get the node package manager called NPM which
   we will utilize to get additional node dependencies

2. Mongo DB http://docs.mongodb.org/manual/installation/, follow the instructions
   for your platform. Note that mongo needs a patch to work correctly in windows,
   an alternative is to create an account on [mongolad](https://mongolab.com/welcome/)
   and use the cloud service. If you install a cloud version of mongo please note
   that you must update the url in express_server.js

3. git http://git-scm.com/downloads, follow the instructions for your platform,
   note that windows users shall install git bundled with [cygwin](http://www.cygwin.com/install.html) please ensure that you include both git and curl  

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

8. Run the test to see if everything is working, this must be done in a separate
   terminal window
   ```
   mocha
   ```
9. You are done

## Typical Flows
I will demonstrate typical flows using CURL, it is then up to the MVC client
developer to use this for input for the XHR-requests from the browser.

### User Registration
```
curl -X POST -d '{"email" : "mrx@gmail.com", "password" : "loko"}' \
  -H "Content-Type: application/json" http://localhost:3000/api/users
```
If successful, this will return a new user in JSON format, note that depending
on where and how you installed your server the URL may differ

### User Logon
Once you have a user in the system, you can use this user to login, which is a
requirement for adding new advertisements.
```
curl -X GET -u 'mrx@gmail.com:loko' http://localhost:3000/api/users/mrx@gmail.com
```
Note that the password and username is what you supplied during user registration,
we use basic authentication. In a real-world application this resource should be
protected by https since we send the password over the wire in base64 encoding.

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
The important bit, which we must utilize later is the userToken, which we will
stick to our http-header to identify ourselves. You may wonder why the server
doesn't make this stick by putting it in a cookie, the easy answer is because it
isn't restful and since this training is about REST we shall apply the stateless
nature of the server.

For now remember your token

### Add a new advertisement
To add a new advertisement, we issue a post, now we need to supply the userToken
in the HTTP header for our identification

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi \
     -H "Content-Type:application/json" \
     -d '{"category": "Phone", "description": "iPhone 5 - Mint Condition", "price": "$200"}' \
  http://localhost:3000/api/advertisments
```
If successful we get the following JSON back, the important bit is the created
_id which we will use later on
```javascript
[
  {
    category: "Phone",
    description: "iPhone 5 - Mint Condition",
    price: "$200",
    owner: "mrx@gmail.com",
    created: "2014-01-31T09:27:34.825Z",
    _id: "52eb6c860e5f433f24000003"
  }
]
```

### Add an image to our advertisement
To make our advertisement more appealing we want to upload an image to the server.
Image uploading can be performed in many ways, but when using a http-browser
[multi-part form](http://www.ietf.org/rfc/rfc2388.txt) is the norm and the
browser handles content-type, size headers etc for you.

When using curl we must include the -F option to tell curl we want to post a
file, in this case our image. Since we want to add the image to our advertisement
we must also include the advertisement Id as a form parameter

```
curl -F "file=@./iphone.gif" -F "advertismentId=52eb6c860e5f433f24000003" \
     http://localhost:3000/api/images
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
We can add multiple images to our advertisement, if we ask the server for the
advertisement now

```
curl http://localhost:3000/api/advertisments/52eb6c860e5f433f24000003
```
We see that the server has updated the advertisement with a link to the added
picture

```javascript
{
  _id: "52eb6c860e5f433f24000003",
  category: "Phone",
  created: "2014-01-31T09:27:34.825Z",
  description: "iPhone 5 - Mint Condition",
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

### Browse advertisements in the system
Now we have added an advertisement so we can browse it in the system, we will
start by not supplying a user-token, e.g. act as a new user who just wants to
buy something, this can easily be achieved with a normal web browser, just click
on the link or modify it if you run your server on a different location

[http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments)

You will see the JSON formatted as text in the browser window, at least if you
run in Google Chrome

But there is more, if you supply a user-token in the header, we go back to curl
to do this, we now get back links, which are shortcuts for edit, delete and
details actions of the resource. These links are typically utilized by a dynamic
client, in rest terms we call this [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS),
which stand for **Hypermedia as the Engine of Application State**. From a REST API
perspective this is important, since the linked parts of the API can be
considered private, and changes to these parts of the API can be made without
having to inform users of the API, that is if they utilized the provided links
in their clients and not hardcoding paths.

```
curl http://localhost:3000/api/advertisments \
     -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi
```

JSON output with links
```javascript
[
{
    _id: "52eb6c860e5f433f24000003",
    category: "Phone",
    created: "2014-01-31T09:27:34.825Z",
    description: "iPhone 5 - Mint Condition",
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
      description: "Update for resource advertisements with id 52eb6c860e5f433f24000003",
      href: "/api/advertisments/52eb6c860e5f433f24000003"
    },
    remove: {
      verb: "DELETE",
      href: "/api/advertisments/52eb6c860e5f433f24000003",
      description: "Delete for resource advertisement with id 52eb6c860e5f433f24000003"
    },
    details: {
      verb: "GET",
      description: "Details for resource advertisements with id 52eb6c860e5f433f24000003",
      href: "/api/advertisments/52eb6c860e5f433f24000003"
    }
  }
]
```

We get back a list of advertisements, since we have only created one, the list
only contains one advertisement. Let's create another advertisement in the
system to make it a bit more interesting, for simplicity we will add another phone

```
curl -X POST -H user-token:ovxptw7z8rveipb9eqc04tjsoky5jyvi \
  -H "Content-Type:application/json" \
  -d '{"category": "Phone", "description": "Samsung S3 -  Perfect Condition", "price": "$200"}' \
  http://localhost:3000/api/advertisments
```

When we look for advertisements now, [http://localhost:3000/api/advertisments](http://localhost:3000/api/advertisments)
we get two phone backs, but the API also let's us provide a query, so lets say
we only want to search for phones with Samsung in the description we would add
the following query parameters to our query

[http://localhost:3000/api/advertisments?category=Phone&description=Samsung](http://localhost:3000/api/advertisments?category=Phone&description=Samsung)

We will only get back the Samsung Phone

## Additional Resource Methods
### Users
1. Delete User
   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/users/:id
   ```
   Set the _token_ and the :id to whatever you want to delete

   Deleting a user also recursively removes all the advertisements added by the user

2. Update User
   ```
curl -X PUT -d '{"email": "email@somewhere.com", "password":"newPwd"}' \
  -H Content-Type:application/json -H user-token:_token_ \
   http://localhost:3000/api/users/:id
   ```
   Set the _token_ and the :id of the user you want to update, note that you may
   only update yourself unless you have the administer role. The content passed
   is a JSON record all the fields of the user. Please note that a HTTP PUT
   overwrites the entire record, so all fields must be supplied in the passed
   record, even the ones you don't change.

### Images
1. Delete an Image

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/image/:id
   ```

   Set the _token_ and the :id to the image you want to delete, deleting an
   image also removes the link to the the image from the advertisement.

###  Advertisements
1. Update an advertisement text

   ```
curl - X PUT -d '{"price": "200", "category":"Phone", "description": "Brand new Ericsson Phone"}' \
   -H Content-Type:application/json -H user-token:_token_ \
   http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisement you want to update, note that
   the JSON record shall be complete in a put
2. Delete an advertisement

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/advertisments/:id
   ```

   Set the _token_ and the :id of the advertisement you want to delete

# Client
This section will cover the actual tutorial of creating a rest client using the
[AngularJS](http://www.angularjs.org) framework

## Table of Contents Client
- [A Static Client](#a-static-client)
- [Background on Angular JS](#background-on-angular-js)
  - [What is Angular](#what-is-angular)
  - [The Zen of Angular](#the-zen-of-angular)
  - [Angular frees you from the following pains](#angular-frees-you-from-the-following-pains)
- [Developing the Angular JS Client](#developing-the-angular-js-client)
  - [Migrating our Static Client to Angular JS - Model and Controller](#migrating-our-static-client-to-angular-js---model-and-controller)
  - [Adding our Presentation Logic](#adding-our-presentation-logic)
     - [Angular JS Service](#angular-js-service)
     - [Partial HTML Code -- Advertisements](#partial-html-code----advertisements)
     - [Advertisment Details](#advertisment-details)
- [Hooking up Angular JS with the REST backend](#hooking-up-angular-js-with-the-rest-backend)
    - [Logging In](#logging-in)
    - [Ordering our displayed advertisments](#ordering-our-displayed-advertisments)
  - [Client Summary](#client-summary)
- [Extras](#extras)
  - [Server](#server-extras)
  - [Client](#client-1)
    - [Adding Images in Angular JS](#adding-images-in-angular-js)
    - [Adding new Advertisements](#adding-new-advertisements)
    - [Edit Advertisement Text](#edit-advertisement-text)
    - [Removing Advertisements from the Client](#removing-advertisements-from-the-client)
    - [Add filtering for Advertiments both on text in description and category](#add-filtering-for-advertiments-both-on-text-in-description-and-category)

## A Static Client
To get an idea what we try to accomplish we start out with a mockup, a static
HTML client of our demo. It will be much easier to reason what we want to build
if we have seen a prototype.

[static site](http://htmlpreview.github.io/?https://github.com/ewernqvi/mvc_rest_demo/blob/master/server/public/static_site.html)

In the static client we see that we have a rather simple application to display
advertisements, it shall also be possible to login and register, once logged in
it shall be possible to add new advertisements, and edit and delete these.
We will convert the application to a dynamic Angular JS application step by step,
but before we do this just a short intro to the Angular JS framework

## Background on Angular JS
The [Angular JS](http://angularjs.org) was created internally within Google in
2009, an engineer named Miško Hevery, he claimed that he could re-write 17 000
lines of front-end code into pure js within two weeks. He almost made the timeline
but the amazing effect was that the application now was down to 1500 lines of code,
they then knew that they where on to something.

Since 2009 the Angular JS framework has been stabilized and is used within several
thousand web-sites around the world.

### What is Angular
AngularJS is a structural framework for dynamic web apps. It lets you use HTML
as your template language and lets you extend HTML's syntax to express your
application's components clearly and succinctly. Out of the box, it eliminates
much of the code you currently write through data binding and dependency injection.
And it all happens in JavaScript within the browser, making it an ideal partner
with any server-side technology.

Angular is what HTML would have been had it been designed for applications.

The mismatch between dynamic applications and static documents is often solved
with:

* A library - Your code is in charge and it calls into the library when it sees
  fit to assist in altering the dom. E.g., jQuery.
* Frameworks - a particular implementation of a web application, where your code
  fills in the details. The framework is in charge and it calls into your code
  when it needs something application specific.
  E.g., knockout, ember, etc.

Angular takes another approach. It attempts to minimize the impedance mismatch
between document centric HTML and what an application needs by creating new HTML
constructs. Angular teaches the browser new syntax through a construct
called [directives](http://docs.angularjs.org/guide/directive).

Angular comes with the following out-of-the-box to assist you with creating an
MVC style application
* [data-binding](http://docs.angularjs.org/guide/databinding)
* [basic templating directives](http://docs.angularjs.org/guide/templates)
* [form validation](http://www.ng-newsletter.com/posts/validations.html)
* [routing and deep-linking](http://docs.angularjs.org/api/ngRoute.directive:ngView)
* [dependency injection](http://docs.angularjs.org/guide/di)

Testability
* [unit-testing](http://docs.angularjs.org/guide/dev_guide.unit-testing)
* [end-to-end testing](http://docs.angularjs.org/guide/dev_guide.e2e-testing)
* [mocks](http://docs.angularjs.org/api/ngMock)
* [Karma test harnesses](http://karma-runner.github.io/0.10/index.html)

###The Zen of Angular
Angular is built around the belief that declarative code is better than
imperative when it comes to building UIs and wiring software components together,
while imperative code is excellent for expressing business logic.

* It is a very good idea to decouple DOM manipulation from app logic. This
  dramatically improves the testability of the code.
* It is a really, really good idea to regard app testing as equal in importance
  to app writing. Testing difficulty is dramatically affected by the way the code
  is structured.
* It is an excellent idea to decouple the client side of an app from the server
  side. This allows development work to progress in parallel, and allows for
  reuse of both sides.
* It is very helpful indeed if the framework guides developers through the
  entire journey of building an app:
  * from designing the UI
  * through writing the business logic
  * to testing.
* It is always good to make common tasks trivial and difficult tasks possible.

###Angular frees you from the following pains

* Registering callbacks
* Manipulating HTML DOM programmatically
* Marshaling data to and from the UI- Data Binding
* Writing tons of initialization code just to get started

for further information please see
* [Angular JS Introduction](http://docs.angularjs.org/guide/introduction)
* [Angular JS API](http://docs.angularjs.org/api)
* [Ten Top Reasons Why to use Angular JS](http://www.sitepoint.com/10-reasons-use-angularjs/)

## Developing the Angular JS Client
Now that we have a very brief understanding what Angular JS is all about it's
time to see it in action. Angular comes with a starter template, I have prepared
this template for our demo application.
We will utilize git to fetch the latest version of our code

```
git checkout -f client-angular1
```

Once checked out we need to install bower, which is a dependency manager for
javascript
```
cd $APP_HOME/server/public
npm install -g bower
```
Where APP_HOME is the root of the application, e.g. the mvc_rest_demo directory.
We will now let bower fetch our application dependencies
````
bower install
```

We know get a new set of files, but most importantly a working skeleton
application that is fully testable and prepared for the tasks to come.

If your node server is not running start it with
```
node express_server.js
```

Once the server has been started it shall be possible to navigate to

[app/index.html](http://localhost:3000/app/index.html)

And you shall see our Angular JS skeleton app with the text Angular JS is
working 4-ever at the button. If you view the code of
[index.html](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/app/index.html)
we can see that angular js libraries are loaded and the {{2+2}} at the button is
evaluated to a 4 which indicates that it's up and running.

To run the [test](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md)
please follow the linked [instructions](https://github.com/ewernqvi/mvc_rest_demo/blob/client-angular1/server/public/run-tests.md).

### Migrating our Static Client to Angular JS - Model and Controller
Now when we have been introduced to the starter application, it's time to get
useful and migrate our static application to a dynamic angular application. We
leave the rest parts behind for now, but create a local mockup repository of our
initial data. To do this we first take a look at the JSON format returned by our
REST-server

```javascript
{
  _id: "52eb6c860e5f433f24000003",
  category: "Phone",
  created: "2014-01-31T09:27:34.825Z",
  description: "i Phone5 - Mint Condition",
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
we could convert the 3 advertisements on the static page to the following JSON

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
Let us create a new partial for our list of advertisements, the HTML code for
this would be

```HTML
<h2>This is where our list of advertisements shall be displayed</h2>
```
advertisments.html

let us save the file as partials/advertisments.html

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

As you probably spotted, we reference a new controller called advertismentsCtrl,
lets open up the controllers.js file and add our controller

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

We deliberately added no code in the controller, since we are test-driven we
shall now modify our test to include the new controller and in the test we shall
state the wanted behavior of our controller, so open up controllersSpec.js to
add our new test

```javascript
describe('controllers', function(){
  beforeEach(module('buyAndSellApp.controllers'));

  it('should create advertisement model with 3 advertisements',
     inject(function($controller) {
    var scope = {},
        ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
    //Check that the controller has a list of three advertisements
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
Note that we use an array to define the function body, this is to ensure that
the code can be minified with the angular dependency injection still working,
see also [angular minification](http://docs.angularjs.org/guide/di)

Rerun our tests, it shall pass now, if it doesn't check your code.

### Adding our Presentation Logic
Before we add the presentation logic, I will try to explain what actually
happens within our Angular application, this is probably best done with a picture.

![alt Angular Image](https://raw.github.com/ewernqvi/mvc_rest_demo/master/pres/angular-overview.png)

Angular applications consist of a Model View and Controller architecture, but
what actually happens in our application is that in index.html the ng-app
directive is loaded which basically tells Angular to take control.

Within our application, which is a Single Page Application, we have the ability
to present partials within the page, these will be swapped in and out depending
on our actions.

In our first example we load the partial advertisments.html which will contain a
div with a controller, which is responsible for the scope. In our case we loop
over the advertisements array with a [ng-repeat](http://docs.angularjs.org/api/ng.directive:ngRepeat)
directive. This let us create rows in our table.The image has a special
[ng-src](http://docs.angularjs.org/api/ng.directive:ngSrc) directive since we
want data binding later on, e.g. if we switch images it should be automatically
reflected in the view through Angular's two-way data binding.

Before we dive into our presentation logic a small refactoring of our
application is needed, remember that we put an array of test-data directly into
our controller, this is poor design so we will introduce a new angular feature
called a [service](http://docs.angularjs.org/guide/dev_guide.services.understanding_services)
where we will place this logic.

#### Angular JS Service
If you managed to get the code working in the previous section, you can continue
with that code-base if not you can check out a working version from the previous
section

```
git checkout -f client-angular2
```

We start out by modifying our test and then implement a simple stub for our
service.

```javascript
  // add the following test
  describe('advertisment', function() {
    it('should return the advertisment service', inject(function(advertisment) {
      expect(advertisment.list().length).toEqual(3);
    }));
  });
```
test/unit/servicesSpec.js

Then we must inform Angular DI that we have a new service available for the
application

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

Running the test now shall result in a failure, since we haven't moved the array
contents yet.

Now modify our AdvertimentCtrl to call the service, move the array to our
advertisement service.

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

Note that we added our service as an injection parameter, then we simply delegate
to the service to set our scope variable. Did you remember to move the array into
the service?

run the test if it's not started, it shall pass now

```
karma start config/karma.conf.js --single-run
```

#### Partial HTML Code -- Advertisements
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

As you may see we create links to render details in a separate view, we will
implement this later, for now the links will not work. We also added reference
to a function

#### Advertisment Details

Create a new advertismentDetails partial

```HTML
<div class="container">
  <hr>
  <h1>{{advertisment.description}}</h1>
  sold by {{advertisment.owner}}
  <div class="large-image" ><img ng-src="{{currentImage.href}}" style="max-height: 600px" ></div>
  <div style="background: grey;">TODO: Thumbnails goes here if several images</div>
  <h2>Price: {{advertisment.price}}</h2>

  <div>{{advertisment.longDescription}}</div>
</div>
```
partials/advertismentDetails.html

Nothing fancy here, just a simple HTML page displaying all the images for the
advertisement and the detailed description of the advertisement. We have left
the small Thumbnails, if we have several picture as an exercise for you. The
simplest way to accomplish this is probably to perform an ng-repeat over the
image array and add an [ng-click](http://docs.angularjs.org/api/ng.directive:ngClick) handler for each thumbnail which calls the scope and sets $scope.currentImage, which will change the image.

```javascript
'use strict';

// Declare app level module which depends on filters, and services
angular.module('buyAndSellApp', [
  'ngRoute',
  'buyAndSellApp.filters',
  'buyAndSellApp.services',
  'buyAndSellApp.directives',
  'buyAndSellApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/advertisment/:id', {templateUrl: 'partials/advertismentDetails.html',
      controller: 'AdvertismentDetailCtrl'});
  $routeProvider.when('/advertisments', {templateUrl: 'partials/advertisments.html',
      controller: 'AdvertismentsCtrl'});
  // Default route

  $routeProvider.otherwise({redirectTo: '/advertisments'});
}]);
```
js/app.js

Here we just add the routing logic, the route is triggered by in the
adverisments.html partial, which we have already completed. The new route refers
to a new controller which we must implement.

```javascript
describe('controllers', function(){
  // our controller
  describe('AdvertismentsCtrl', function(){
    var scope, ctrl;
    beforeEach(module('buyAndSellApp'));

    beforeEach(inject(function($controller) {
      scope = {};
      ctrl = $controller('AdvertismentsCtrl', {$scope:scope});
    }));.

    it('should create advertisment model with 3 advertisments',
    function($controller){
      //Check that the controller has a list of three advertisments
      expect(scope.advertisments.length).toBe(3);   
    })
  });
});
```
test/unit/controllersSpec.js

Our new advertismentDetail controller test, at this stage the test will fail,
since we have not created the controller yet.

```javascript
 buyAndSellApp.controller('AdvertismentDetailCtrl',['$scope', '$routeParams', 'advertisment',
                                               function($scope, $routeParams, advertisment) {
        $scope.adId = $routeParams.id;
                $scope.adId = $routeParams.id;
        $scope.advertisment = {};
        // Note that we utilize a promise here, since this will be asynchronous
        // when we later will communicate with the server
        advertisment.get($scope.adId).then(function(res){
           $scope.advertisment = res;
           $scope.currentImage = res.images[0];
        }, function(err){console.log('error: '+ err)});

        $scope.formatDate = formatDate;
  }]);
```
js/controllers.js

When adding the controller logic, we realize that we need a new method in our
advertisement service to communicate with the advertisement on the server-side.
Since we at this instance do not have more details when getting a single resource,
we simply pick out the correct resource from the existing list method. We also
introduced a new concept called promises or futures in java.

In an asynchronous word promises are as important as try and catch in the
synchronous world. The promise let us manage dependencies between shared
resources in a nice way, I found the following [blog post](http://andyshora.com/promises-angularjs-explained-as-cartoon.html)
about promises really good, please have a look.

In Angular a stripped variant of the Q library is used, is is called [$q](http://docs.angularjs.org/api/ng.$q)
and should be injected as a dependency.

```javascript
// inject service dependencies, while we are at it we inject the $http service
angular.module('buyAndSellApp.services', [], function($provide) {
  $provide.factory('version', [ function() {
    return '0.1';
  }]);
  $provide.factory('advertisment', ['$http', '$q', function(httpSvc, q){
    return new advertisment(httpSvc, q);
  }]);  

function advertisment($http, $q){
  function list(){
        return [
                {
                _id: "dummy-client-id1",
                category: "Hobbies",
                created: "2014-02-04T09:27:34.825Z",
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
                created: "2014-02-11T09:27:34.825Z",
                description: "Premium Long Board",
                images: [
                         {
                     contentType: "image/jpg",
                      advertismentId: "dummy-client-idr2",
                      href: "https://raw.github.com/ewernqvi/mvc_rest_demo/master/server/test-data/img/longboard.jpg"
                         }
                         ],
                owner: "mrx@gmail.com",
                price: "$220"
                },
                {
                _id: "dummy-client-id3",
                category: "Hobbies",
                created: "2014-02-10T09:27:34.825Z",
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
  }
  return{
    get: function(adId){
      var deferred = $q.defer();
      var res=null;
      // Dummy implementation for now, we shall call the server
      var l=list();
      for(var i=0; i < l.length; i++){
        if(l[i]._id === adId){
          res = l[i];
          break;
        }
      }
      if(res)
        deferred.resolve(res);
      else
        deferred.reject('Advertisment with id: ' + adId + ' not found!');

      return deferred.promise;

    },
    list: list
  }
}
});
```
js/services.js

Now we have created a working detail page, and all the tests run it's time to
communicate with our back-end server

### Hooking up Angular JS with the REST backend
Our get service is well prepared for backend communication, since we implemented
it using a promise it is now just a matter of

But before we begin, let's check out the latest code
```
git checkout -f client-angular4
```
Lets start to modify the list service, it will return a promise, since $http
does so by default. This means we have to make some small adjustments in the
controller following the same pattern as we did for the AdvertismentsDetailCtrl

```javascript
// the $http API is based on the deferred/promise APIs exposed by the $q service
// so it returns a promise for us by default
return $http.get('/api/advertisments')
  .then(function(response) {
    if (typeof response.data === 'object') {
      return response.data;
    } else {
      // invalid response
      return $q.reject(response.data);
    }
  }, function(err) {
      // something went wrong
      return $q.reject(err.data);
});
```
app/services.js

The little modification in the controller
```javascript
 buyAndSellApp.controller('AdvertismentsCtrl',['$scope', 'advertisment',
                                               function($scope, advertisment) {
        advertisment.list().then(function(result){
          $scope.advertisments=result
        }, function(err){console.log('error: '+ err);});
        $scope.formatDate = formatDate;
  }]);
```
Now we shall be able to see advertisements from the server, that is if we loaded
some using CURL earlier. If we click and advertisment loading details will fail
now, since we call the list service, which is a promise now, so let's adjust the
advertisment.get method so it communicates with the backend.

```javascript
  return{
    get: function(adId){
     return $http.get('/api/advertisments/' + adId).then(function(response) {
      if (typeof response.data === 'object') {
        return response.data;
      }else{
        // invalid response
        return $q.reject(response.data);
      }
    }, function(err) {
      // something went wrong
      return $q.reject(err.data);
    });

    },
    list: list
  }
```
app/services.js

We know have an application that works as expected. We could add some more
end-2-end tests, but I will leave that as an exercise for you.

### Logging In

Create a new login partial, set a variable in the root scope or local storage
holding the user-token

```HTML
<div class="container">
  <div class="row">
  <div ng-hide="login.user" class="col-md-6">
    <form action="" ng-submit="login.connect()">
      <fieldset>
        <legend>Login</legend>
        <p><input ng-model="login.login" name="email" type="text" placeholder="Login" required /></p>
        <p><input ng-model="login.password" name="password" type="password" placeholder="Password" required /></p>
        <p><button type="submit">Login</button></p>
      </fieldset>
    </form>
  </div>
  <div ng-hide="login.user" div class="col-md-6">
      <form action="" ng-submit="login.register()">
      <fieldset>
        <legend>Register new User</legend>
        <p><input ng-model="login.new.user" name="email" type="text" placeholder="your email" required /></p>
        <p><input ng-model="login.new.password" name="password" type="password" placeholder="Password" required /></p>
        <p><button type="submit">Register</button></p>
      </fieldset>
    </form>
  </div>

  </div>

  <div ng-show="login.user">
    <p>Welcome, {{login.user._id}} : token {{login.user.userToken}}!</p>
    <p><button ng-click="login.disconnect()">Logout</button></p>
  </div>
</div>
```
partials/login.html

Nothing fancy here, just a simple form divided into a login section and a
register new user section. Submitting the form will trigger a controller and
if successful login the user will be transferred back to the advertisements
overview. When an existing user has checked in, the loaded list of advertisements
are checked against the owner-id, if one matches the data is re-loaded.

```javascript
'use strict';

// Declare app level module which depends on filters, and services
angular.module('buyAndSellApp', [
  'ngRoute',
  'buyAndSellApp.filters',
  'buyAndSellApp.services',
  'buyAndSellApp.directives',
  'buyAndSellApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/loginRegister', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/advertisment/:id', {templateUrl: 'partials/advertismentDetails.html',
      controller: 'AdvertismentDetailCtrl'});
  $routeProvider.when('/advertisments', {templateUrl: 'partials/advertisments.html',
      controller: 'AdvertismentsCtrl'});
  // Default route

  $routeProvider.otherwise({redirectTo: '/advertisments'});
}]);
```
js/app.js

Here we just add the routing logic, the route is triggered by the login button
on the index.html page.

```javascript
 buyAndSellApp.controller('LoginController', ['$scope', 'user',
     function($scope, user){
        $scope.login = {};
        $scope.login.user = null;

        $scope.login.connect = function() {
          user.connect($scope.login.login, $scope.login.password, function(res){
            if(res.error) alert(err);
            $scope.login.user = res;
          });
        }

        $scope.login.register = function() {
          var newUser = {email: $scope.login.new.user,
                         password: $scope.login.new.password};
          user.register(newUser, function(res) {
            if(res.error) alert(err);
            $scope.login.user = res;
          });
         };

         $scope.login.disconnect = function() {
           $scope.login.user = null;
           user.logout();
         };
     }]);
```
js/controllers.js

When adding the controller logic, we realize that we need a login service to
communicate with the user-resource on the server-side. We can mock this service
in our test to make it work without depending on the backend.

```javascript
 $provide.factory('user', ['$http', function(httpSvc){return new user(httpSvc);}]);  

function user($http){
  var _user={};
  var connFn = function(username, password, res){
      function utf8_to_b64( str ) {
        return window.btoa(unescape(encodeURIComponent( str )));
      }
      $http.defaults.headers.common['Authorization'] = 'Basic ' +
         utf8_to_b64(username + ':' + password);
      $http.get('/api/users/'+ username).success(function(data, status) {
            if (status < 200 || status >= 300)
                return;
            _user = data;
            $http.defaults.headers.common['user-token'] = _user.userToken;
            res(_user);
        }).error(function(err, status, headers, config) {
          if(status == 418){
            res( {error: err});
          }
        });
        delete $http.defaults.headers.common.Authorization;

  };
  return{
    register: function(newUser, res) {
        $http.post('/api/users/', newUser).success(function(data, status) {
            _user = data[0];
            // Now we have to call get, to get our token
            connFn(_user.email, _user.password, res);
        }).error(function(err, status, headers, config) {
            return {error: err};
        });
    },
    connect: connFn,
    logout: function(){
      delete $http.defaults.headers.common['user-token'];
    }
  };
}  
```
js/services.js

When we have added our service we shall be able to login, we still have not
handled login-errors and registration errors in a good way, we leave this as an
exercise for you!.

### Ordering our displayed advertisments
[Order By](http://docs.angularjs.org/api/ng.filter:orderBy)

## Client Summary
We have now completed part of our application, now it's just a matter of applying
the same technique to finish the reminder of the application or start a new
project of your own.
# Extras
## Server Extras
Modify the server to support CORS, this is rather simple just follow the linked
[instructions](https://npmjs.org/package/cors)

Make sure you configures the Access-Control-Allow-Headers CORS property to allow
our user-token header.

Modify the port of the  server and start an additional instance, let the first
server serve your HTML-pages this way the REST-API is on a different domain from
a web-browser perspective.

e.g. access the client on http://localhost:3333/app

and the server-rest-api on http://localhost:3000/api/advertisments

## Client
### Adding Images in Angular JS
Adding an image to an advertisement is not that hard if we post a form, but in
our single page application we do not want to do this, so instead we must rely
on posting FormData in our advertisement service.

see [Simple Example](http://jsfiddle.net/JeJenny/ZG9re/)

There are many more advanced plugins available for Angular if you prefer drag
and drop, preview etc.

### Adding new Advertisements
If the user is logged in, just:

1. Add a link at button of the page to trigger this route
2. Update js/app.js with the new route and a controller
3. Add a test and the new controller
4. Add an addAdvertisement.html partial where you display the information in a
   form, use what you learned in the [Adding Images in Angular JS](#Adding Images in Angular JS)
   to enable adding images, removing an image is just a matter of calling the
   DELETE method on the image resource. Note that you must add a placeholder
   advertisement to be able to add an image.
5. Add methods in our advertisement service to communicate with
   * POST /api/images - Add image
   * POST /api/advertisments - Add an advertisement

Good Luck!

### Edit Advertisement Text
If the user is logged in, just:

1. Add an edit icon on the left of an advertisement with an edit link
2. Clicking on the icon shall trigger the edit route
3. Update js/app.js with the new route and a controller
4. Add a test and the new controller
5. Add a editAdvertisement.html partial where you display the information in a form
   Removing an image is just a matter of calling the DELETE method on the image resource.
6. Add methods in our advertisement service to communicate with
   * DELETE /api/images:id - Remove an image
   * PUT /api/advertisments - Update the text of the advertisement

Good Luck!
### Removing Advertisements from the Client
Add a wast-bin right of the advertisement, if a delete link exist for the advertisement. When clicked
use the verb and href provided in the link to perform a delete on the server-side.

### Add filtering for Advertiments both on text in description and category
You can do this in two ways, either on the client-side only, then angular does this for you, but this
requires that you have a site with a limited number of advertisments, for show you may try it out it
is barely no coding required

[Angular Search Filter](http://docs.angularjs.org/api/ng.filter:filter)

Add the filter attributes to ng-repeat

If you want to do this properly you shall forward the filter to REST-API on the server, this is just
a matter of adding query parameters to the url for the list service
