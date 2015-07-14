/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var del = require('del');

module.exports = function(gulp, config) {

    gulp.task('jshint', function() {
        return gulp.src(config.PATHS.src + '/**/*.js')
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.jshint.reporter('fail'));
    });

    gulp.task('_svgsprite', function() {
        del.sync(config.PATHS.dist + '/assets/svg/sprite.svg');
        return gulp.src(config.PATHS.src + '/assets/svg/sprite/*.svg')
            .pipe($.svgstore())
            .pipe(gulp.dest(config.PATHS.dist + '/assets/svg'));
    });

    gulp.task('_resources', function() {
        return gulp.src(config.PATHS.src + '/resources/**/*.*')
            .pipe(gulp.dest(config.PATHS.dist + '/resources'));
    });
};
