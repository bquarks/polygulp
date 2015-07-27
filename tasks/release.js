/* global module, require, console */

module.exports = function(gulp) {

    'use strict';

    var runSequence = require('run-sequence').use(gulp);
    var gutil = require('gulp-util');
    var bump = require('gulp-bump');
    var git = require('gulp-git');
    var fs = require('fs');
    var argv = require('yargs').argv;

    var my = {

        bumpConfig: function() {
            var config = {};

            if (argv.version) {
                config.version = argv.version;
            } else if (argv.minor) {
                config.type = 'minor';
            } else if (argv.major) {
                config.type = 'major';
            } else if (argv.patch) {
                config.type = 'patch';
            } else {
                throw new Error('You must specify the semver (patch, minor, major) or a specific version (eg. gulp release --version 1.0.1)');
            }
            return config;
        },

        version: function() {
            // Parses the json file instead of using require because require caches multiple calls so the version number won't be updated
            return JSON.parse(fs.readFileSync('./bower.json', 'utf8')).version;
        }

    };

    // Bump
    gulp.task('bump-version', function() {

        return gulp.src(['./bower.json', './package.json'])
            .pipe(bump(my.bumpConfig())).on('error', gutil.log)
            .pipe(gulp.dest('./'));
    });

    // Commit after bumping
    gulp.task('commit-changes', function() {
        var version = my.version();

        return gulp.src('.')
            .pipe(git.commit('Bumped version number ' + version, {
                args: '-a'
            }));
    });

    // Push changes
    gulp.task('push-changes', function(cb) {
        git.push('origin', 'master', cb);
    });

    // Create new tag with the Bower version
    gulp.task('tag-version', function(cb) {
        var version = my.version();

        git.tag(version, 'Created Tag for version: ' + version, function(error) {
            if (error) {
                return cb(error);
            }
            git.push('origin', 'master', {
                args: '--tags'
            }, cb);
        });
    });

    gulp.task('release', function(callback) {
        runSequence(
            'bump-version',
            'commit-changes',
            'push-changes',
            'tag-version',
            function(error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log('RELEASE FINISHED SUCCESSFULLY');
                }
                callback(error);
            });
    });

};
