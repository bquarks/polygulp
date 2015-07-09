/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');
var historyApiFallback = require('connect-history-api-fallback');

module.exports = function(gulp, config) {

    var runSequence = require('run-sequence').use(gulp);
    var bsConfig = {
        notify: false,
        server: {
            middleware: [historyApiFallback()],
            baseDir: config.PATHS.dist,
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    };
    var server = function() {
        browserSync(bsConfig);
    };

    gulp.task('styles', function() {
        return gulp.src(config.PATHS.src + '/**/*.css')
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('js', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('html', function() {
        return gulp.src(config.PATHS.src + '/**/*.html')
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('resources', function() {
        return gulp.src(config.PATHS.src + '/resources/**/*.*')
            .pipe(gulp.dest(config.PATHS.dist + '/resources'));
    });

    gulp.task('img', function() {
        return gulp.src([config.PATHS.src + '/**/*.{png,jpg,gif,svg}', '!' + config.PATHS.src + '/assets/svg/sprite/sprite.svg'])
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('svgsprite', function() {
        del.sync(config.PATHS.dist + '/assets/svg/sprite/sprite.svg');
        return gulp.src(config.PATHS.src + '/assets/svg/sprite/*.svg')
            .pipe($.svgstore())
            .pipe(gulp.dest(config.PATHS.dist + '/assets/svg/sprite'));
    });

    gulp.task('serve', ['jshint'], function() {

        del.sync(config.PATHS.dist);
        server();

        gulp.watch([config.PATHS.src + '/**/*.html'], reload);
        gulp.watch([config.PATHS.src + '/**/*.js'], ['jshint', 'js', reload]);
        gulp.watch([config.PATHS.src + '/resources/**/*.*'], ['resources', reload]);
        gulp.watch([config.PATHS.src + '/**/*.css'], ['styles', reload]);
        gulp.watch([config.PATHS.src + '/**/*.html'], ['html', reload]);
        gulp.watch([config.PATHS.src + '/**/*.{png,jpg,gif,svg}'], ['img', reload]);
        gulp.watch([config.PATHS.src + '/assets/svg/sprite/*.svg'], ['svgsprite', reload]);

        return runSequence(
            'js',
            'translate',
            'styles',
            'html',
            'resources',
            'img',
            'svgsprite'
        );

    });

    gulp.task('serve:dist', ['dist'], function() {
        server();
    });

};
