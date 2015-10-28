/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var merge = require('merge-stream');
    var path = require('path');
    var glob = require('glob');
    var fs = require('fs');
    var runSequence = require('run-sequence').use(gulp);

    // Copy All Files At The Root Level (app)
    gulp.task('copy', function() {
        var app = gulp.src([
            'app/*',
            '!app/test',
            '!app/precache.json'
        ], {
            dot: true
        }).pipe(gulp.dest(config.paths.dist));

        var bower = gulp.src([
            'bower_components/**/*'
        ]).pipe(gulp.dest('dist/bower_components'));

        var elements = gulp.src([config.paths.app + '/elements/**/*.html'])
            .pipe(gulp.dest(config.paths.dist + '/elements'));

        var scripts = gulp.src([config.paths.app + '/**/*.js'])
            .pipe(gulp.dest(config.paths.dist));

        var locales = gulp.src([config.paths.tmp + '/resources/locales/**/*'])
            .pipe(gulp.dest(config.paths.dist + '/resources/locales/'));

        var mocks = gulp.src([config.paths.app + '/resources/mocks/**/*'])
            .pipe(gulp.dest(config.paths.dist + '/resources/mocks/'));

        // var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
        //     .pipe(gulp.dest('dist/sw-toolbox'));

        return merge(app, bower, elements, locales, mocks, scripts)
            .pipe($.size({
                title: 'copy'
            }));
    });

    // Scan Your HTML For Assets & Optimize Them
    gulp.task('usemin', function() {
        return gulp.src([config.paths.app + '/**/*.html', '!{test}/**/*.html'])
        .pipe($.usemin({
            css: [$.rev],
            html: [function () { return $.minifyHtml({
                    quotes: true,
                    empty: true,
                    spare: true
                });
            }],
            js: [$.uglify, $.rev],
            inlinejs: [$.uglify],
            inlinecss: [$.minifyCss, 'concat']
        }))
        .pipe(gulp.dest(config.paths.dist));
    });

    // Vulcanize imports
    gulp.task('vulcanize', function() {
        return gulp.src(config.paths.dist + '/main/imports.html')
            .pipe($.vulcanize(config.vulcanize))
            .pipe(gulp.dest(config.paths.dist + '/main'))
            .pipe($.size({
                title: 'vulcanize:imports'
            }));
    });

    // Generate a list of files that should be precached when serving from 'dist'.
    // The list will be consumed by the <platinum-sw-cache> element.
    gulp.task('precache', function(callback) {
        var dir = config.paths.dist;

        glob('{elements,scripts,styles}/**/*.*', {
            cwd: dir
        }, function(error, files) {
            if (error) {
                callback(error);
            } else {
                files.push('index.html', './', 'bower_components/webcomponentsjs/webcomponents-lite.min.js');
                var filePath = path.join(dir, 'precache.json');
                fs.writeFile(filePath, JSON.stringify(files), callback);
            }
        });
    });

    // Build Production Files, the Default Task
    gulp.task('default', ['clean'], function(cb) {
        runSequence(
            '_translate', ['copy', 'styles'], ['elements', 'pages'], ['jshint', 'images', 'svgsprite', 'fonts', 'usemin'],
            'vulcanize',
            cb);
        // Note: add , 'precache' , after 'vulcanize', if your are going to use Service Worker
    });
};
