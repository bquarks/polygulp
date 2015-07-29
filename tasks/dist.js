/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var del = require('del');
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

        var resources = gulp.src([config.paths.tmp + '/resources/locales/**/*'])
            .pipe(gulp.dest(config.paths.dist + '/resources/locales'));

        // var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
        //     .pipe(gulp.dest('dist/elements/bootstrap'));
        //
        // var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
        //     .pipe(gulp.dest('dist/sw-toolbox'));

        return merge(app, bower, elements, resources, scripts)
            .pipe($.size({
                title: 'copy'
            }));
    });

    // Scan Your HTML For Assets & Optimize Them
    gulp.task('html', function() {
        var assets = $.useref.assets({
            searchPath: [config.paths.tmp, config.paths.app]
        });

        return gulp.src([config.paths.app + '/**/*.html', '!{test}/**/*.html'])
            .pipe(assets)
            // Concatenate And Minify JavaScript
            .pipe($.if('*.js', $.uglify()))
            // Concatenate And Minify Styles
            // In case you are still using useref build blocks
            .pipe($.if('*.css', $.cssmin()))
            .pipe(assets.restore())
            .pipe($.useref())
            // Minify Any HTML
            .pipe($.if('*.html', $.minifyHtml({
                quotes: true,
                empty: true,
                spare: true
            })))
            // Output Files
            .pipe(gulp.dest(config.paths.dist))
            .pipe($.size({
                title: 'html'
            }));
    });

    // Vulcanize imports
    gulp.task('vulcanize', function() {

        var imports = gulp.src(config.paths.dist + '/main/imports.html')
            .pipe($.vulcanize(config.vulcanize))
            .pipe(gulp.dest(config.paths.dist + '/main'))
            .pipe($.size({
                title: 'vulcanize:imports'
            }));

        var routes = gulp.src(config.paths.dist + '/routes/routes.html')
            .pipe($.vulcanize(config.vulcanize))
            .pipe(gulp.dest(config.paths.dist + '/routes'))
            .pipe($.size({
                title: 'vulcanize:routes'
            }));

        return merge(imports, routes);
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
            '_translate', ['copy', 'styles'], ['elements', 'pages'], ['jshint', 'images', 'svgsprite', 'fonts', 'html'],
            'vulcanize',
            cb);
        // Note: add , 'precache' , after 'vulcanize', if your are going to use Service Worker
    });
};
