/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var merge = require('merge-stream');
    var path = require('path');
    var glob = require('glob');
    var fs = require('fs');
    var replace = require('gulp-replace');
    var lazypipe = require('lazypipe');
    var polyclean = require('polyclean');
    var runSequence = require('run-sequence').use(gulp);

    // Copy All Files At The Root Level (app)
    gulp.task('copy', function() {
        var app = gulp.src([
            'app/*',
            '!app/test',
            '!app/precache.json'
        ], {
            dot: true
        }).pipe(gulp.dest(config.findPath()));

        var bower = gulp.src([
            'bower_components/**/*'
        ]).pipe(gulp.dest(config.findPath('bower_components')));

        var elements = gulp.src([config.paths.app + '/elements/**/*.html'])
            .pipe(gulp.dest(config.findPath('elements')));

        var scripts = gulp.src([config.paths.app + '/**/*.js'])
            .pipe(gulp.dest(config.findPath()));

        var resources = gulp.src([config.paths.app + '/resources/**/*'])
            .pipe(gulp.dest(config.findPath('resources')));

        var locales = gulp.src([config.paths.tmp + '/resources/locales/**/*'])
            .pipe(gulp.dest(config.findPath('resources/locales')));

        // var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
        //     .pipe(gulp.dest('dist/sw-toolbox'));

        return merge(app, bower, elements, scripts, resources, locales)
            .pipe($.size({
                title: 'copy'
            }));
    });

    // Scan Your HTML For Assets & Optimize Them
    gulp.task('html', function() {
        return gulp.src([config.paths.app + '/**/*.html', '!' + config.paths.app + '/assets{,/**}/*.html'])
            .pipe($.usemin({
                css: [$.rev],
                html: [

                    function() {
                        return $.minifyHtml(config.optimize.html);
                    }
                ],
                js: [$.uglify, $.rev],
                inlinejs: [$.uglify],
                inlinecss: [$.minifyCss, 'concat']
            }))
            .pipe(gulp.dest(config.findPath()));
    });

    // Vulcanize imports
    gulp.task('vulcanize', function() {

        var cleanupPipe = lazypipe()
            .pipe(polyclean.cleanCss)
            .pipe(polyclean.leftAlignJs)
            .pipe(polyclean.uglifyJs)
            .pipe(replace, 'hidden="" by-vulcanize=""', '');

        return gulp.src(config.paths.dist + '/main/imports.html')
            .pipe($.vulcanize(config.vulcanize))
            .pipe(cleanupPipe())
            .pipe(gulp.dest(config.findPath('main')))
            .pipe($.size({
                title: 'vulcanize:imports'
            }));
    });

    // Generate a list of files that should be precached when serving from 'dist'.
    // The list will be consumed by the <platinum-sw-cache> element.
    gulp.task('precache', function(callback) {
        glob('{elements,scripts,styles}/**/*.*', {
            cwd: config.paths.dist
        }, function(error, files) {
            if (error) {
                callback(error);
            } else {
                files.push('index.html', './', 'bower_components/webcomponentsjs/webcomponents-lite.min.js');
                var filePath = path.join(config.paths.dist, 'precache.json');
                fs.writeFile(filePath, JSON.stringify(files), callback);
            }
        });
    });

    // Build Production Files, the Default Task
    gulp.task('default', ['clean'], function(cb) {
        runSequence(
            '_translate', '_config', ['copy', 'styles'], ['jshint', 'images', 'fonts', 'html'],
            'vulcanize',
            cb);
        // Note: add , 'precache' , after 'vulcanize', if your are going to use Service Worker
    });
};
