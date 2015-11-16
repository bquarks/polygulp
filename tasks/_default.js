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
                return path.join(config.paths.app, stylesPath, src);
            }))
            .pipe($.changed(stylesPath, { extension: '.css' }))
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest(config.paths.tmp + stylesPath))
            .pipe($.csslint('.csslintrc'))
            .pipe($.csslint.reporter())
            .pipe($.if('*.css', $.minifyCss()))
            .pipe(gulp.dest(config.findPath(stylesPath)))
            .pipe($.size({ title: stylesPath }));
    };

    var imageOptimizeTask = function(src, dest) {
        return gulp.src(src)
        .pipe($.imagemin(config.optimize.image))
        .pipe(gulp.dest(dest))
        .pipe($.size({ title: 'images' }));
    };

    // Compile and Automatically Prefix Stylesheets
    gulp.task('styles', function() {
        return styleTask('/', ['**/*.css']);
    });

    // Lint JavaScript
    gulp.task('jshint', function() {
        return gulp.src([
                config.paths.app + '/**/*.js'
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
        return imageOptimizeTask(config.paths.app + '/assets/**/*', config.findPath('assets'));
    });

    // Generate SVGsprite
    gulp.task('svgsprite', function() {
        del.sync(config.paths.dist + '/assets/svg/sprite.svg');
        gulp.src(config.paths.app + '/assets/svg/sprite/*.svg')
            .pipe($.svgmin())
            .pipe($.svgstore())
            .pipe(gulp.dest(config.findPath('assets/svg')));
    });

    // Copy Web Fonts To Dist
    gulp.task('fonts', function() {
        return gulp.src([config.paths.app + '/assets/fonts/**'])
            .pipe(gulp.dest(config.findPath('assets/fonts')))
            .pipe($.size({
                title: 'fonts'
            }));
    });

    // Clean Output Directory
    gulp.task('clean', del.bind(null, [config.paths.tmp, config.paths.dist]));
};
