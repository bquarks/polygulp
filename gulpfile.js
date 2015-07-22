'use strict';

/* global module, require */

var customMedia = require("postcss-custom-media");
var nested = require('postcss-nested');
var autoprefixer = require('autoprefixer');
var extend = require('deep-extend');
var atImport = require("postcss-import");

module.exports = function(gulp, appSettings) {

    var defaults = {
        PATHS: {
            src: 'app',
            dist: 'dist',
            test: 'test'
        },
        postcssProcessors: [
            atImport,
            customMedia,
            nested,
            autoprefixer({
                browsers:  [
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
        ]
    };

    // Merge user settings with default config
    var config = extend({}, defaults, appSettings);

    // Load tasks
    require('./tasks/default')(gulp, config);
    require('./tasks/deploy')(gulp, config);
    require('./tasks/release')(gulp);
    require('./tasks/testing')(gulp, config);
    require('./tasks/server')(gulp, config);
    require('./tasks/dist')(gulp, config);
    require('./tasks/translate')(gulp, config);

    return config;
};
