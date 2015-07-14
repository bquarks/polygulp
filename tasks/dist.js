/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var del = require('del');
var merge = require('merge-stream');

module.exports = function(gulp, config) {

    var runSequence = require('run-sequence').use(gulp);
    var options = {
        imagemin: {
            progressive: true
        },
        vulcanize: {
            dest: config.PATHS.dist,
            strip: true,
            inlineCss: true,
            inlineScripts: true
        },
        htmlmin: {
            removeComments: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            customAttrAssign: [/\?=/, /\$=/]
        }
    };

    gulp.task('_dist:img', function() {
        return gulp.src([config.PATHS.src + '/**/*.{png,jpg,gif,svg}', '!' + config.PATHS.src + '/assets/svg/sprite/*.*'])
            .pipe($.imagemin(options.imagemin))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_dist:styles', function() {
        return gulp.src(config.PATHS.src + '/**/*.css')
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_dist:index', function() {
        return gulp.src(config.PATHS.src + '/index.html')
            .pipe($.htmlmin(options.htmlmin))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_dist:js', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe($.stripDebug())
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_bower', function() {
        return gulp.src('bower_components/**/*.*')
            .pipe(gulp.dest(config.PATHS.dist + '/bower_components'));
    });

    gulp.task('dist', ['jshint'], function() {

        return runSequence(
            '_dist:js',
            '_dist:index',
            '_dist:styles',
            '_dist:img',
            '_svgsprite',
            '_translate'
        );

    });
};
