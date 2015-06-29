/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();

module.exports = function(gulp, config) {
    gulp.task('jshint', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'));
        // .pipe($.jshint.reporter('fail'));
    });
};
