/* global module, require */

/***********************************************************************************
Create custom config                                                               *
Features:                                                                          *
- Create/Modify app.common.config:                                                 *
     - app.common.config.appName                                                   *
     - app.common.config.version                                                   *
     - app.common.config.composr                                                   *
     - app.common.config.webfs                                                     *
     - app.common.config.analyticsID                                               *
- Extend default config.json with env config.json                                  *
- Update project bower.json & package.json version & name                          *
                                                                                   *
Project configuration:                                                             *
- Define a default config.json file in resources/config/config.json                *
- Define environment config.json files in: resources/config/{{envName}}/config.json *
- Set debug flag in config.json to receive feedback of the task                    *
***********************************************************************************/


module.exports = function(gulp, config) {

    'use strict';

    var gutil = require('gulp-util');
    var requireDir = require('require-dir');
    var path = require('path');
    var _ = require('underscore');
    var fs = require('fs');
    var mkdirp = require('mkdirp');

    var projectConfig = requireDir(path.resolve(config.paths.app + '/resources/config'));
    var projectConfigDir = path.resolve(config.paths.tmp + '/resources/config');
    var buildEnv;

    if (process && process.env) {
        buildEnv = process.env.environment || process.env.NODE_ENV;
    }

    var initDirs = function() {
        mkdirp.sync(projectConfigDir);
    };

    /**
     * gutil wrappers to send custom feedback
     * @type {Object}
     */
    var configLog = {
        debug: true,

        _log: function(type, message) {
            if (!this.debug) {
                return;
            }

            gutil.log('config.json', gutil.colors[type](message));
        },

        success: function(message) {
            this._log('green', message);
        },

        info: function(message) {
            this._log('blue', message);
        },

        warning: function(message) {
            this._log('yellow', message);
        },

        error: function(message) {
            this._log('red', message);
        }
    };

    /**
     * Build a endpoints object with domain and/or version provided
     * @method function
     * @param  {Object} endpoints
     * @param  {String} domain
     * @param  {String} version
     * @return {Object}
     * @example
     * var endpoints = {"publishers": "publisher", "feedback": "feedback"};
     * var domain = "booqs:nubico:demo";
     * var version = "v0";
     * buildEndpoints(endpoints, domain, version)
     * ->
     * {"publishers":"booqs:nubico:demo/snapshot/publisher/", "feedback":"booqs:nubico:demo/snapshot/feedback/"}
     */
    var buildEndpoints = function(endpoints, domain, version) {
        if (!endpoints) {
            configLog.warning('No endpoints provided. Check composr config');
            return '';
        }

        var builtEndpoints = {};

        domain = domain ? (domain + '/') : '';
        version = version ? (version + '/') : '';

        for (var i in endpoints) {
            builtEndpoints[i] = domain +
                version +
                endpoints[i] + '/';
        }

        return builtEndpoints;
    };

    /**
     * Build composr config
     * @method function
     * @param  {Object} options
     * @return {String}         Stringified js snippet with app.common.config.composr
     */
    var buildComposrConfig = function(options) {
        var extension = {};
        var composrConfig = options.composr;
        var endpoints = buildEndpoints(composrConfig.endpoints, composrConfig.domain, composrConfig.version);

        composrConfig.endpoints = endpoints;

        return addToConfig(options, 'composr', extension);
    };

    /**
     * Creates a new js snippet wich modify a param in app.common.config
     * Optionally, if the param to modify is an object you can extend it
     * @method function
     * @param  {Object} options
     * @param  {String} param
     * @param  {Object} extension
     * @return {String}           Stringified js snippet with app.common.config[param]
     */
    var addToConfig = function(options, param, extension) {

        if (!options[param]) {
            configLog.warning('No' + param + 'config provided');
            return '';
        }

        var js = 'window.app.common.config["' + param + '"] = ';
        var paramConfig = options[param];

        if (extension) {
            _.extend(paramConfig, extension);
        }

        js = js + JSON.stringify(paramConfig) + '; ';

        return js;
    };

    /**
     * Creates a js snippet wich adds or modifies app.common.config
     * @method function
     * @param  {Object} options
     * @return {String}         Stringified js snippet
     */
    var createConfig = function(options) {
        var js = 'window.app = window.app || {}; ';
        js = js + 'window.app.common = window.app.common || {}; ';
        js = js + 'window.app.common.config = window.app.common.config || {}; ';

        // Set debug mode
        configLog.debug = (options.debug === 'true');

        // Build composr config
        js = js + buildComposrConfig(options);

        // Build webfs config
        js = js + addToConfig(options, 'webfs');

        // Add appName, version, clientType, analyticsID
        js = js + addToConfig(options, 'appName');
        js = js + addToConfig(options, 'version');
        js = js + addToConfig(options, 'clientType');
        js = js + addToConfig(options, 'analyticsID');

        return js;
    };

    /**
     * Extend default config file with env config file (if exists)
     * @method function
     */
    var extendConfigFile = function() {
        var projectEnvConfig;

        try {
            projectEnvConfig = requireDir(path.resolve(config.paths.app + '/resources/config/' + buildEnv));
            // Try to access config object to test if config.json exists
            Object.keys(projectEnvConfig.config);
            projectEnvConfig = projectEnvConfig.config;
            configLog.info('Using ' + buildEnv + ' config.json');
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // Provide feedback when env file exists but it has errors (e.g. Syntax Error)
                configLog.error('Error in ' + buildEnv + ' config.json: ' + err);
            }
            configLog.info('No env configuration provided. Using default config.json (DEV mode)');
            return;
        }

        _.each(projectEnvConfig, function(value, key) {
            console.log('Before: ', projectConfig.config);
            _.extend(projectConfig.config[key], value);
            console.log('After: ', projectConfig.config);
        });
    };

    gulp.task('_config', function() {
        if (!projectConfig.config) {
            configLog.error('No config.json provided');
            return;
        }

        extendConfigFile();

        var config = createConfig(projectConfig.config);

        initDirs();

        // Create config.js tmp file
        // Adds or modify app namespace
        // Access to the custom config in app.common.config
        fs.writeFile(projectConfigDir + '/config.js', config);

    });

};
