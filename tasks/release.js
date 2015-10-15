/* global module, require, console */

module.exports = function(gulp, config) {

    'use strict';

    var runSequence = require('run-sequence').use(gulp);
    var replace = require('gulp-replace');
    var gutil = require('gulp-util');
    var bump = require('gulp-bump');
    var git = require('gulp-git');
    var fs = require('fs');
    var path = require('path');
    var argv = require('yargs').argv;

    var my = {

        bumpConfig: function() {
            var settings = {};

            if (argv.version) {
                settings.version = argv.version;
            } else if (argv.minor) {
                settings.type = 'minor';
            } else if (argv.major) {
                settings.type = 'major';
            } else if (argv.patch) {
                settings.type = 'patch';
            } else {
                throw new Error('You must specify the semver (patch, minor, major) or a specific version (eg. gulp release --version 1.0.1)');
            }

            return settings;
        },

        version: function() {
            // Parses the json file instead of using require because require caches multiple calls so the version number won't be updated
            return JSON.parse(fs.readFileSync('./bower.json', 'utf8')).version;
        },

        branch: function() {
            if(argv.branch !== true && argv.branch) {
                return argv.branch;
            } else {
                return false;
            }
        }
    };

    // Bump version
    gulp.task('checkout-branch', function() {
        if(my.branch()) {
            return git.checkout(my.branch());
        } else {
            throw new Error('You must specify a branch name');
        }
    });

    // Bump version
    gulp.task('bump-version', function() {
        return gulp.src(['./bower.json', './package.json'])
            .pipe(bump(my.bumpConfig())).on('error', gutil.log)
            .pipe(gulp.dest('./'));
    });

    // Replace version in files with the specified version
    gulp.task('replace-version', function() {

        return config.projectInfo.versionFiles.map(function(filePath) {
            gutil.log(filePath);
            return gulp.src(filePath)
                .pipe(replace(config.projectInfo.versionRegex, '$1' + '\'' + my.version() + '\''))
                .pipe(gulp.dest(path.dirname(filePath))).on('error', gutil.log);
        });
    });

    // Commit after bumping
    gulp.task('commit-changes', function() {
        return gulp.src('.')
            .pipe(git.commit('Bumped version number ' + my.version(), {
                args: '-a'
            }));
    });

    // Push changes
    gulp.task('push-changes', function() {
        return git.push('origin', my.branch()).on('error', gutil.log);
    });

    // // Create new tag with the Bower version
    gulp.task('tag-version', function(cb) {
        var version = my.version();

        git.tag(version, 'Created Tag on the for version: ' + version, function(error) {
            if (error) {
                return cb(error);
            }
            git.push('origin', my.branch(), {
                args: '--tags'
            });
        });
    });

    gulp.task('release', function(callback) {
        runSequence(
            'checkout-branch',
            'bump-version',
            'replace-version',
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
