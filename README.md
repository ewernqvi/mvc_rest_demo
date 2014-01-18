mvc_rest_demo
=============

A repo for an mvc rest demo held internally at Altran, the company where I work

The REST part of the application has three resources

users
advertisments
images

Supported resource scenarious are

* User registration -> post a new user

* User login -> get against a user resource, protected by basic auth

* Browse advertisments  /api/advertisments, anonymous access

* Create new advertisment -> post to /api/advertisments, requires login and a newly created image if required

* Edit advertisment -> login required, you may only edit your own unless the user is administrator

* Delete advertisment -> login required, you may only delete your own unless the user is administrator

* Advertisment details -> api/advertisments/:id, get, logged in users will get links to edit and delete. A typical link is sent in json in the following format 
```javascript
{rel:'PUT', desc:'Update advertisment, requires user token', href:'/api/advertisment/123435'}
```

* Upload image -> Post

* Delete image -> requires login


