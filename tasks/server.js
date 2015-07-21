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

    gulp.task('_server:styles', function() {
        return gulp.src(config.PATHS.src + '/**/*.css')
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_server:js', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_server:html', function() {
        return gulp.src(config.PATHS.src + '/**/*.html')
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_server:img', function() {
        return gulp.src([config.PATHS.src + '/**/*.{png,jpg,gif,svg}', '!' + config.PATHS.src + '/assets/svg/sprite/*.*'])
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('serve', ['jshint'], function() {

        del.sync(config.PATHS.dist);

        gulp.watch([config.PATHS.src + '/**/*.html'], reload);
        gulp.watch([config.PATHS.src + '/**/*.js'], ['jshint', '_server:js', reload]);
        gulp.watch([config.PATHS.src + '/resources/**/*.*'], ['_resources', reload]);
        gulp.watch([config.PATHS.src + '/**/*.css'], ['_server:styles', reload]);
        gulp.watch([config.PATHS.src + '/**/*.html'], ['_server:html', reload]);
        gulp.watch([config.PATHS.src + '/**/*.{png,jpg,gif,svg}'], ['_server:img', reload]);
        gulp.watch([config.PATHS.src + '/assets/svg/sprite/*.svg'], ['_svgsprite', reload]);

        return runSequence(
            '_server:js',
            '_translate',
            '_server:styles',
            '_server:html',
            '_resources',
            '_server:img',
            '_svgsprite',
            server
        );
    });

    gulp.task('serve:dist', ['jshint'], function() {
        del.sync(config.PATHS.dist);

        return runSequence(
            '_vulcanize',
            '_dist:index',
            '_dist:img',
            '_svgsprite',
            '_translate',
            server
        );
    });

};
