'use strict';

/* global module, require */

module.exports = function(gulp) {

    var nightwatch = require('gulp-nightwatch');
    var karma = require('karma').server;
    var argv = require('yargs').argv;
    var _ = require('underscore');

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
            configFile: 'test/karma.conf.js',
            singleRun: true
        }, done);
    });

    /**
     * Watch for file changes and re-run tests on each change
     */
    gulp.task('tdd', function(done) {
        karma.start({
            configFile: 'test/karma.conf.js'
        }, done);
    });

    /**
     * Run selenium test with command line options (optional)
     */
    gulp.task('nightwatch', function() {
        gulp.src('')
            .pipe(nightwatch({
                configFile: 'test/nightwatch.json',
                cliArgs: my.commandLine()
            }));
    });
};
