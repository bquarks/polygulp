'use strict';

/* global module, require */

module.exports = function(gulp) {

    var config = {
        PATHS: {
            src: 'app',
            dist: 'dist'

        },
        AUTOPREFIXER_BROWSERS: [
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
    };

    // Load tasks
    require('./tasks/testing')(gulp);
    require('./tasks/release')(gulp);
    require('./tasks/server')(gulp, config);
    require('./tasks/dist')(gulp, config);
};
