module.exports = function(config){
    config.set({
    basePath : './',

    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-*/angular-*.js',
      'test/lib/angular/angular-mocks.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    exclude : [
      'bower_components/angular/angular-loader.js',
      'bower_components/angular/*.min.js',
      'bower_components/angular/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-coverage',
            'karma-jasmine'
            ],

    preprocessors : {
      'app/js/*.js': 'coverage'
               },

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    reporters : ['progress', 'coverage']

})}
