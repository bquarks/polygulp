/* global module, require */

'use strict';

var $ = require('gulp-load-plugins')();

module.exports = function(gulp, config) {

    gulp.task('clean:dist', function() {
        return gulp.src(config.PATHS.dist)
            .pipe($.clean());
    });

    // gulp.task('dist', ['clean:dist'], function() {

    //     return gulp.src(config.PATHS.src + '/elements/elements.html')
    //         .pipe($.vulcanize({
    //             strip: true,
    //             inlineCss: true,
    //             inlineScripts: true
    //         })).on('error', function(error) {
    //             console.log(error);
    //         })
    //         .pipe(gulp.dest(config.PATHS.dist));
    // });

    gulp.task('dist', ['clean:dist'], function() {
        return gulp.src(config.PATHS.src + '/**/*')
            .pipe($.if(/.*\.(?:jpg|gif|png|bmp)$/, $.imagemin({
                progressive: true
            }).pipe($.rev())))
            .pipe($.if(/assets\/svg\/.+\.svg/, $.svgmin().pipe($.rev())))
            .pipe($.if(/assets\/fonts\/.+/, $.rev()))
            .pipe($.if(/assets\/svg\/sprite\/.+\.svg/, $.svgstore().pipe(gulp.dest(config.PATHS.dist + '/assets/svg/sprite')).pipe($.rev())))
            .pipe($.if('*.js', $.uglify()))
            .pipe($.if('*.css', $.cssmin().pipe($.usemin())))
            .pipe($.if('*.html', $.htmlmin({
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeEmptyAttributes: true,
                customAttrAssign: [/\?=/, /\$=/]
            }).pipe($.usemin())))
            .pipe(gulp.dest(config.PATHS.dist));
    });

};
