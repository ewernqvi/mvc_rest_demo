There are two suites of tests configured both unit and end2end

You must install [karma](http://karma-runner.github.io/0.10/index.html) and the dev dependencies before you start, this is done by

```
npm install -g karma
npm install
```

For end-2-end test we will utilize [protracor](protractor node_modules/protractor/example/conf.js),
follow the instructions in the linked page on how to set-up protractor for your platform.

The unit tests are configured to be run as soon as you change a file, this way you do not forget to
run a test, to start the continous unit tests just run the following command from this directory

```
karma start 
```

Code coverage is placed in a coverage directory, just open it and browse for an index.html file and open it in the browser to get a result.

if you like to run the tests just once issue the following command instead

```
karma start  --single-run
```

To start the end2end test just run the following command, the e2e tests are run against the web-server
so if you have not started it please do so with

```
cd ..
node express_server.js
```

To start the test run the following command
```
protractor your-protactor-conf-dir/conf.js
```

The karma results are saved in an xml-file in
./node_modules/karma/test-results.xml
