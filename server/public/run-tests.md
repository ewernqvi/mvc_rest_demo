There are two suites of tests configured both unit and end2end

You must install karma and the dev dependencies before you start, this is done by

```
npm install -g karma
npm install
```

If you run this application without the port 3000 for the express server you will have to
change config/karma-e2e.conf.js to the new port

The unit tests are configured to be run as soon as you change a file, this way you do not forget to
run a test, to start the continous unit tests just run the following command from this directory

```
karma start config/karma.conf.js
```

if you like to run the tests just once issue the following command instead

```
karma start congig/karma.conf.js --single-run
```

To start the end2end test just run the following command, the e2e tests are run against the web-server
so if you have not started it please do so with

```
cd ..
node express_server.js
```

To start the test run the following command
```
karma start config/karma-e2e.conf.js
```

The results are saved in an xml-file in
./node_modules/karma/test-results.xml

