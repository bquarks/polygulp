/* global module, require, process, console */

'use strict';

var $ = require('gulp-load-plugins')();
var fs = require('fs');

module.exports = function(gulp, config) {

    gulp.task('deploy', ['dist'], function() {

        var env = process.env.environment || 'integration';
        var bucket = JSON.parse(fs.readFileSync(config.PATHS.src + '/resources/config/' + env + '/config.json', 'utf8')).deploy.bucket;

        var publisher = $.awspublish.create({
            params: {
                Bucket: bucket,
                region: 'eu-west-1'
            }
        });

        var headers = {
            'Cache-Control': 'max-age=2592000'
        };

        return gulp.src(config.PATHS.dist + '/**/*')
            .pipe($.awspublish.gzip({
                ext: '.gz'
            }))
            .pipe(publisher.publish(headers))
            .pipe(publisher.cache())
            .pipe($.awspublish.reporter());

    });

};
