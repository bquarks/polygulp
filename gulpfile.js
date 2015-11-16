/* global module, require, console */

module.exports = function(gulp, options) {

    'use strict';

    var _ = require('underscore');

    // postcss plugins
    var path = require('path');
    var customMedia = require('postcss-custom-media');
    var nested = require('postcss-nested');
    var autoprefixer = require('autoprefixer');
    var extend = require('deep-extend');
    var atImport = require('postcss-import');

    var defaults = {
        projectInfo: {
            versionRegex: /(version\s?[=:]\s?)["']\d.{3,}['"]/g, // version: 0.0.0 || version = 0.0.0
            versionFiles: [],
        },
        paths: {
            tmp: '.tmp',
            app: 'app',
            dist: 'dist',
            test: 'test',
            translations: ''
        },
        postcssProcessors: [
            atImport,
            customMedia,
            nested,
            autoprefixer({
                browsers: [
                    'ie >= 10',
                    'ie_mob >= 10',
                    'ff >= 30',
                    'chrome >= 34',
                    'safari >= 7',
                    'opera >= 23',
                    'ios >= 7',
                    'android >= 4.4',
                    'bb >= 10'
                ]
            })
        ],
        optimize: {
            html: {
                quotes: true,
                empty: true,
                spare: true
            },
            image: {
                progressive: true,
                interlaced: true,
                svgoPlugins: [
                    { collapseGroups: false }
                ]
            }
        },
        vulcanize: {
            implicitStrip: true,
            stripComments: false,
            inlineCss: true,
            inlineScripts: true
        }
    };

    // Merge user settings with default config
    var config = extend({}, defaults, options);

    // Get the correct dist path
    config.findPath = function(subpath) {
        return !subpath ? config.paths.dist : path.join(config.paths.dist, subpath);
    };

    // Load tasks for web-component-tester
    // Adds tasks for `gulp test:local` and `gulp test:remote`
    // require('web-component-tester').gulp.init(gulp);

    // Load custom tasks from the `tasks` directory
    try {
        var tasks = require('require-dir')('./tasks');
        _.each(tasks, function(task) {
            task(gulp, config);
        });
    } catch (err) {
        console.log('Error: ', err);
    }

    return config;

};
