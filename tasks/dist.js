/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var del = require('del');
var merge = require('merge-stream');
var path = require('path');

module.exports = function(gulp, config) {

    var runSequence = require('run-sequence').use(gulp);
    var options = {
        imagemin: {
            progressive: true
        },
        vulcanize: {
            stripComments: true,
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

    gulp.task('usemin', function() {
        return gulp.src(config.PATHS.src + '/*.html')
            .pipe($.usemin({
                css: [$.minifyCss(), 'concat'],
                html: [$.htmlmin(options.htmlmin)],
                js: [$.uglify()],
                inlinejs: [$.uglify()],
                inlinecss: [$.minifyCss(), 'concat']
            }))
            .pipe(gulp.dest(config.PATHS.dist));
    });

    gulp.task('_vulcanize', function() {

        var index = gulp.src(config.PATHS.src + 'index.html')
            .pipe($.vulcanize(options.vulcanize))
            .pipe(gulp.dest(config.PATHS.dist))
            .pipe($.size({
                title: 'vulcanize'
            }));

        var imports = gulp.src(config.PATHS.src + '/main/imports.html')
            .pipe($.vulcanize(options.vulcanize))
            .pipe(gulp.dest(config.PATHS.dist + '/main'))
            .pipe($.size({
                title: 'vulcanize:imports'
            }));

        var routes = gulp.src(config.PATHS.src + '/routes/routes.html')
            .pipe($.vulcanize(options.vulcanize))
            .pipe(gulp.dest(config.PATHS.dist + '/routes'))
            .pipe($.size({
                title: 'vulcanize:routes'
            }));

        return merge(imports, routes);
    });

    gulp.task('_bower', function() {
        return gulp.src('bower_components/webcomponentsjs/**/*.js').pipe(gulp.dest(config.PATHS.dist + '/bower_components/webcomponentsjs'));
    });

    gulp.task('dist', ['jshint'], function() {

        del.sync(config.PATHS.dist);

        return runSequence(
            '_vulcanize',
            '_bower',
            '_dist:index',
            '_dist:img',
            '_svgsprite',
            '_translate'
        );

    });
};
