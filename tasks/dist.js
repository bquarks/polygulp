/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var del = require('del');

module.exports = function(gulp, config) {

    gulp.task('clean:dist', function(cb) {
        del(config.PATHS.dist, cb);
    });

    gulp.task('dist', ['clean:dist', 'jshint', 'styles'], function() {

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

        var svg = $.svgmin().pipe($.svgstore()).pipe(gulp.dest(config.PATHS.dist + '/assets/svg/sprite'));
        var index = $.htmlmin(options.htmlmin);

        return gulp.src(config.PATHS.src + '/**/*')
            .pipe($.if(/.*\.(?:jpg|gif|png|bmp)$/, $.imagemin(options.imagemin)))
            .pipe($.if('*.svg', svg))
            .pipe($.if('*.css', $.autoprefixer(config.AUTOPREFIXER_BROWSERS)))
            // .pipe($.if(/(?:elements|pages)\/.+\/.+\.html/, $.vulcanize(options.vulcanize)))
            .pipe($.if(/index\.html/, index))
            .pipe(gulp.dest(config.PATHS.dist));
    });
};
