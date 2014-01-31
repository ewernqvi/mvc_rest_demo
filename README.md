MVC REST Demo
=============

##Purpose
The purpose of this repository is to work as a RESTful backend for an MVC style architecure tutorial. The application consists of two parts.

* REST Server
* MVC Client

## Server
The REST server part of the application has three resources

1. Users
2. Advertisments
3. Images

I will demonstrate typical flows using CURL, it is then up to the MVC client developer to use this for input for the XHR-requests from the browser.

### Installation
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

### Typical Flows
#### User Registration
```
curl -X POST -d '{"email" : "mrx@gmail.com", "password" : "loko"}' \ 
  -H "Content-Type: application/json" http://localhost:3000/api/users
```
If successful, this will return a new user in JSON format, note that depending on where and how you installed your server the URL may differ

#### User Logon
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

#### Add a new advertisment
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

#### Add an image to our advertisment
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

#### Browse advertisments in the system
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

### Additional Resource Methods
#### Users
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

#### Images
1. Delete an Image

   ```
curl -X DELETE -H user-token:_token_ http://localhost:3000/api/image/:id
   ```

   Set the _token_ and the :id to the image you want to delete, deleting an image also removes the link to the the image from the advertisment.

####  Advertisments
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


