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

    gulp.task('svgsprite', function() {
        return gulp.src(config.PATHS.src + '/assets/svg/sprite/*.svg')
            .pipe($.svgstore())
            .pipe(gulp.dest(config.PATHS.src + '/assets/svg/sprite'));
    });

    gulp.task('serve', ['jshint', 'styles', 'svgsprite'], function() {

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
        gulp.watch([config.PATHS.src + '/assets/svg/sprite/*.svg'], ['svgsprite', reload]);

    });

};
