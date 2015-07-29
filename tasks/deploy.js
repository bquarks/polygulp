/* global module, require, process */

module.exports = function(gulp, config) {

    'use strict';

    var $ = require('gulp-load-plugins')();
    var fs = require('fs');

    gulp.task('deploy', ['default'], function() {

        var env = process.env.environment || 'integration';
        var bucket = JSON.parse(fs.readFileSync(config.paths.src + '/resources/config/' + env + '/config.json', 'utf8')).deploy.bucket;

        var publisher = $.awspublish.create({
            params: {
                Bucket: bucket
            },
            region: 'eu-west-1'
        });

        var headers = {
            'Cache-Control': 'max-age=2592000'
        };

        return gulp.src(config.paths.dist + '/**/*.*')
            .pipe($.awspublish.gzip({
                ext: ''
            }))
            .pipe(publisher.publish(headers))
            .pipe(publisher.sync())
            .pipe(publisher.cache())
            .pipe($.awspublish.reporter());
    });
};
