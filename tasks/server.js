/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

module.exports = function(gulp, config) {

    gulp.task('styles', function() {
        return gulp.src(config.PATHS.src + '/**/*.css')
            .pipe($.autoprefixer(config.AUTOPREFIXER_BROWSERS));
    });

    gulp.task('jshint', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'));
    });

    gulp.task('serve', ['jshint', 'styles'], function() {

        browserSync({
            notify: false,
            server: {
                baseDir: config.PATHS.src,
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });

        gulp.watch([config.PATHS.src + '/**/*.html'], reload);
        gulp.watch([config.PATHS.src + '/**/*.js'], ['jshint', reload]);
        gulp.watch([config.PATHS.src + '/**/*.css'], ['styles', reload]);

    });

};
