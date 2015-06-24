/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var PATHS = {
    src: 'app',
    dist: 'dist'
};

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

module.exports = function(gulp) {

    gulp.task('styles', function() {
        return gulp.src(PATHS.src + '/**/*.css')
            .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS));
    });

    gulp.task('jshint', function() {
        return gulp.src(PATHS.src + '/**/*.js')
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'));
    });

    gulp.task('serve', ['jshint', 'styles'], function() {

        browserSync({
            notify: false,
            server: {
                baseDir: PATHS.src,
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });

        gulp.watch([PATHS.src + '/**/*.html'], reload);
        gulp.watch([PATHS.src + '/**/*.js'], ['jshint', reload]);
        gulp.watch([PATHS.src + '/**/*.css'], ['styles', reload]);

    });

};
