/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var nightwatch = require('gulp-nightwatch');
    var karma = require('karma').server;
    var argv = require('yargs').argv;
    var _ = require('underscore');
    var path = require('path');

    var my = {

        commandLine: function() {

            var options = [];

            _.each(argv, function(element, index) {
                options.push('--' + index + ' ' + element);
            });

            return options.slice(1, options.length - 1);
        }

    };

    /**
     * Run test once and exit
     */
    gulp.task('test', function(done) {
        karma.start({
            configFile: path.resolve(config.paths.test + '/karma/karma.conf.js'),
            singleRun: true
        }, done);
    });

    /**
     * Run test for CI once and exit
     */
    gulp.task('test:ci', function(done) {
        karma.start({
            configFile: path.resolve(config.paths.test + '/karma/karma.conf.js'),
            singleRun: true,
            browsers: ['PhantomJS']
        }, done);
    });

    /**
     * Watch for file changes and re-run tests on each change
     */
    gulp.task('tdd', function(done) {
        karma.start({
            configFile: path.resolve(config.paths.test + '/karma/karma.conf.js')
        }, done);
    });

    /**
     * Run selenium test with command line options (optional)
     */
    gulp.task('selenium', function() {
        gulp.src('')
            .pipe(nightwatch({
                configFile: path.resolve(config.paths.test + '/nightwatch/nightwatch.json'),
                cliArgs: my.commandLine()
            }));
    });
};
