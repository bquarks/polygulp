/* global module, require */

/***********************************************************************************
Create custom config                                                               *
Features:                                                                          *
- Create/Modify app.common.config:                                                 *
     - app.common.config.appName                                                   *
     - app.common.config.version                                                   *
     - app.common.config.backend                                                   *
     - app.common.config.webfs                                                     *
     - app.common.config.analyticsID                                               *
     - app.common.config.compatibility                                            *
- Extend default config.json with env config.json                                  *
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
    var argv = require('yargs').argv;
    var playScraper = require('google-play-scraper');

    var projectConfig = requireDir(path.resolve(config.paths.app + '/resources/config'));
    var projectConfigDir = path.resolve(config.paths.tmp + '/resources/config');
    var buildEnv;

    if (argv.environment) {
        buildEnv = argv.environment;
    } else if (process && process.env) {
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
     * var domain = "demo";
     * var version = "v0";
     * buildEndpoints(endpoints, domain, version)
     * ->
     * {"publishers":"demo/snapshot/publisher/", "feedback":"demo/snapshot/feedback/"}
     */
    var buildEndpoints = function(endpoints, domain, version) {
        if (!endpoints) {
            configLog.warning('No endpoints provided. Check endpoints config');
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
     * Build backend config
     * @method function
     * @param  {Object} options
     * @return {String}         Stringified js snippet with app.common.config.backend
     */
    var buildBackendConfig = function(options) {
        var backendConfig = _.clone(options.backend);
        var endpoints = buildEndpoints(backendConfig.endpoints, backendConfig.domain, backendConfig.version);

        backendConfig.endpoints = endpoints;

        return addToConfig(options, 'backend', backendConfig);
    };

    /**
     * Build smart banner config extracted from play store
     * @method function
     * @param  {Object} options
     * @return {Object}         Promise resolved with a stringified snippet with app.common.config.smartBanner
     */
    var buildSmartBannerConfig = function(options) {
        var playScraperPromise = new Promise(function(resolve, reject) {
            if (!options.smartBanner) {
                var errorText = 'No smartBanner config provided';
                configLog.warning(errorText);
                reject(errorText);
                return;
            }

            playScraper.app({
                appId: options.smartBanner.id
            }).then(function(res) {
                var smartBannerConfig = {
                    title: res.title,
                    author: res.developer
                };

                var js = addToConfig(options, 'smartBanner', smartBannerConfig);

                resolve(js);
            }).catch(function(err) {
                reject(err);
            });
        });

        return playScraperPromise;
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
            configLog.warning('No ' + param + ' config provided');
            return '';
        }

        var js = 'window.app.common.config["' + param + '"] = ';
        var paramConfig = options[param];

        if (extension) {
            if (_.isObject(paramConfig)) {
                paramConfig = _.clone(paramConfig);
                _.extend(paramConfig, extension);
            } else {
                paramConfig = extension;
            }
        }

        js = js + JSON.stringify(paramConfig) + '; ';

        return js;
    };

    /**
     * Creates a js snippet wich adds or modifies app.common.config
     * @method function
     * @param  {Object} options
     * @return {Object}         Promise resolved with a stringified js snippet
     */
    var createConfig = function(options) {
        var configPromise;
        var inmediateConfig;
        var js = 'window.app = window.app || {}; ';
        js = js + 'window.app.common = window.app.common || {}; ';
        js = js + 'window.app.common.config = window.app.common.config || {}; ';

        // Set debug mode
        configLog.debug = (options.debug === 'true');

        // Add appName, version, clientType, compatibility, analyticsID
        inmediateConfig = ['appName', 'version', 'clientType', 'compatibility', 'analyticsID'];

        for (var i in inmediateConfig) {
            js = js + addToConfig(options, inmediateConfig[i]);
        }

        // Build backend config
        js = js + buildBackendConfig(options);

        // Build webfs config
        js = js + addToConfig(options, 'webfs');

        // Build smartBanner config
        configPromise = new Promise(function(resolve) {
            buildSmartBannerConfig(options)
                .then(function(res) {
                    js = js + res;
                    resolve(js);
                })
                .catch(function(err) {
                    configLog.error('SmartBanner config error: ' + err);
                    resolve(js);
                });
        });

        return configPromise;
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
        } catch (err) {
            if (err.code !== 'ENOENT') {
                // Provide feedback when env file exists but it has errors (e.g. Syntax Error)
                configLog.error('Error in ' + buildEnv + ' config.json: ' + err);
            }
            configLog.info('No env configuration provided. Using default config.json (DEV mode)');
            return;
        }

        _.each(projectEnvConfig, function(value, key) {
            _.extend(projectConfig.config[key], value);
        });
    };

    gulp.task('_environment', function() {
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
        config.then(function(res) {
            fs.writeFile(projectConfigDir + '/config.js', res);
        });

    });

};
