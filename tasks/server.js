/* global module, require */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var browserSync = require('browser-sync');
    var reload = browserSync.reload;
    var del = require('del');
    var historyApiFallback = require('connect-history-api-fallback');

    // Watch Files For Changes & Reload
    gulp.task('serve', ['styles', 'elements', 'pages', 'images', 'svgsprite', '_translate'], function() {
        browserSync({
            notify: false,
            logPrefix: 'PSK',
            snippetOptions: {
                rule: {
                    match: '<span id="browser-sync-binding"></span>',
                    fn: function(snippet) {
                        return snippet;
                    }
                }
            },
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: {
                baseDir: [config.paths.tmp, config.paths.app],
                middleware: [historyApiFallback()],
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });

        gulp.watch([config.paths.app + '/**/*.html'], reload);
        gulp.watch([config.paths.app + '/styles/**/*.css'], ['styles', reload]);
        gulp.watch([config.paths.app + '/elements/**/*.css'], ['elements', reload]);
        gulp.watch([config.paths.app + '/pages/**/*.css'], ['pages', reload]);
        gulp.watch([config.paths.app + '/assets/images/**/*'], reload);
        gulp.watch([config.paths.app + '/**/*.js'], ['jshint']);
    });

    // Build and serve the output from the dist build
    gulp.task('serve:dist', ['default'], function() {
        browserSync({
            notify: false,
            logPrefix: 'PSK',
            snippetOptions: {
                rule: {
                    match: '<span id="browser-sync-binding"></span>',
                    fn: function(snippet) {
                        return snippet;
                    }
                }
            },
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: config.paths.dist,
            middleware: [historyApiFallback()]
        });
    });
};
