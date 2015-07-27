/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var del = require('del');
    var path = require('path');
    var browserSync = require('browser-sync');
    var reload = browserSync.reload;

    var styleTask = function(stylesPath, srcs) {
        return gulp.src(srcs.map(function(src) {
                return path.join(config.path.app, stylesPath, src);
            }))
            .pipe($.changed(stylesPath, {
                extension: '.css'
            }))
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest('.tmp/' + stylesPath))
            .pipe($.if('*.css', $.cssmin()))
            .pipe(gulp.dest('dist/' + stylesPath))
            .pipe($.size({
                title: stylesPath
            }));
    };

    // Compile and Automatically Prefix Stylesheets
    gulp.task('styles', function() {
        return styleTask('styles', ['**/*.css']);
    });

    gulp.task('elements', function() {
        return styleTask('elements', ['**/*.css']);
    });

    gulp.task('pages', function() {
        return styleTask('pages', ['**/*.css']);
    });

    // Lint JavaScript
    gulp.task('jshint', function() {
        return gulp.src([
                config.path.app + 'elements/**/*.js',
                config.path.app + 'pages/**/*.js',
                config.path.app + 'routes/**/*.js',
                config.path.app + 'main/**/*.js'
            ])
            .pipe(reload({
                stream: true,
                once: true
            }))
            .pipe($.jshint.extract()) // Extract JS from .html files
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
    });

    // Optimize Images
    gulp.task('images', function() {
        return gulp.src(config.path.app + 'assets/**/*')
            .pipe($.cache($.imagemin({
                progressive: true,
                interlaced: true
            })))
            .pipe(gulp.dest(config.path.dist + 'assets/'))
            .pipe($.size({
                title: 'images'
            }));
    });

    gulp.task('svgsprite', function() {
        del.sync(config.path.dist + 'assets/svg/sprite.svg');
        gulp.src(config.path.app + 'assets/svg/sprite/*.svg')
            .pipe($.svgstore())
            .pipe(gulp.dest(config.path.dist + 'assets/svg'));
    });

    // Copy Web Fonts To Dist
    gulp.task('fonts', function() {
        return gulp.src(['app/fonts/**'])
            .pipe(gulp.dest('dist/fonts'))
            .pipe($.size({
                title: 'fonts'
            }));
    });

    // Clean Output Directory
    gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
};
