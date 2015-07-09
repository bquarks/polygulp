/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();
var del = require('del');
var merge = require('merge-stream');

module.exports = function(gulp, config) {

    var runSequence = require('run-sequence').use(gulp);

    gulp.task('src', function() {

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
        var styles = $.postcss(config.postcssProcessors);
        var js = $.stripDebug();

        var bower = gulp.src('bower_components/**/*.*').pipe(gulp.dest(config.PATHS.dist + '/bower_components'));

        var src = gulp.src(config.PATHS.src + '/**/*')
            .pipe($.if(/.*\.(?:jpg|gif|png|bmp)$/, $.imagemin(options.imagemin)))
            .pipe($.if('*.svg', svg))
            .pipe($.if('*.css', styles))
            .pipe($.if('*.js', js))
            // .pipe($.if(/(?:elements|pages)\/.+\/.+\.html/, $.vulcanize(options.vulcanize)))
            .pipe($.if(/index\.html/, index))
            .pipe(gulp.dest(config.PATHS.dist));

            // Deletes dist path
            del.sync(config.PATHS.dist);

            return merge(src, bower);
    });

    gulp.task('dist', ['jshint', 'src', 'translate']);
};
