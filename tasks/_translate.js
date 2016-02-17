/* global module, require */


module.exports = function(gulp, config) {

    'use strict';

    var requireDir = require('require-dir');
    var path = require('path');
    var _ = require('underscore');
    var fs = require('fs');
    var mkdirp = require('mkdirp');

    if (!config.paths.translations) {
        return;
    }

    // translate
    var translations = requireDir(path.resolve(config.paths.translations));
    var localesDir = path.resolve(config.paths.tmp + '/resources/locales');
    var projectConfig = requireDir(path.resolve(config.paths.app + '/resources/config'));
    var projectConfigDir = path.resolve(config.paths.tmp + '/resources/config');
    var chars = {
        '{{': '__',
        '}}': '__'
    };

    var pluralKeys = {
        zero: '_plural_0',
        one: '',
        two: '_plural_2',
        few: '_plural_3',
        many: '_plural',
        other: '_plural_indefinite'

    };

    var getParsedTerm = function(term, definition) {
        var pluralKey;
        var parsedTermKey;
        var splittedTerm = term.split('_');
        var parsedTerm = {
            key: term,
            value: ''
        };

        if (!_.has(pluralKeys, _.last(splittedTerm))) {
            parsedTerm.value = definition;
            return parsedTerm;
        }

        pluralKey = pluralKeys[_.last(splittedTerm)];
        parsedTermKey = term.replace('_' + _.last(splittedTerm), '') + pluralKey;
        parsedTerm.key = parsedTermKey;
        parsedTerm.value = definition;

        return parsedTerm;
    };

    var replaceChars = function(term) {
        _.each(chars, function(value, key) {
            term = term.replace(new RegExp(key, 'g'), value);
        });

        term = term.trim();
        return term;
    };

    var parseLang = function(terms) {
        var parsedTerm;
        var parsedTerms = {};
        _.each(terms, function(term) {
            term.term = replaceChars(term.term);
            parsedTerm = getParsedTerm(term.term, term.definition);

            if (parsedTerms[parsedTerm.key]) {
                _.extend(parsedTerms[parsedTerm.key], parsedTerm.value);
            } else {
                parsedTerms[parsedTerm.key] = parsedTerm.value;
            }
        });
        return parsedTerms;
    };

    var initDirs = function() {
        mkdirp.sync(localesDir);
        mkdirp.sync(projectConfigDir);
    };

    /**
     * Build a route path with a given structure
     * @method function
     * @param  {String} pathStruc
     * @param  {object} pathTermsObject
     * @return {String}
     * @example
     * var pathStruc = '/route_thematic/:thematicId/route_book/:bookId';
     * var pathTermsObject = {route_thematic: ['tematica', 'thematic'], route_book: ['libro', 'book']};
     * buildRoutePath(pathStruc, pathTermsObject)
     * ->
     * '/(tematica|thematic)/:thematicId/(libro|book)/:bookId'
     */
    var buildRoutePath = function(pathStruc, pathTermsObject) {
        var joinedRouteNames;

        _.each(pathTermsObject, function(routeNames, routeKey) {
            joinedRouteNames = '(' + routeNames.join('|') + ')';
            pathStruc = pathStruc.replace(routeKey, joinedRouteNames);
        });

        return pathStruc;
    };

    /**
     * Build a route object
     * @method function
     * @param  {object} langBundles
     * @param  {String} pathStruc
     * @return {object}             A route object
     * @example
     * buildRoute(langBundles, '/route_thematic/:thematicId/route_book/:bookId')
     * ->
     * {
        	route: '/(tematica|thematic)/:thematicId/(libro|book)/:bookId',
        	es: ['tematica', 'libro'],
        	en: ['libro', 'book']
        }
     */
    var createRoute = function(langBundles, pathStruc) {
        var route = {};
        var pathTerms = pathStruc.split('/');
        var pathTermsObject = {};

        _.each(langBundles, function(bundle, langName) {
            route[langName] = [];

            for (var i in pathTerms) {
                var term = pathTerms[i];
                var routeName = bundle[term];

                if (routeName) {
                    route[langName].push(routeName);

                    pathTermsObject[term] = pathTermsObject[term] || [];
                    pathTermsObject[term].push(routeName);
                }
            }

        });

        route.route = buildRoutePath(pathStruc, pathTermsObject);

        return route;
    };

    /**
     * Create a routes.js file
     * @method function
     * @param  {object} langBundles
     * @return {object}             routes object
     */
    var createRoutes = function(langBundles) {
        var routesStruc = projectConfig.config.routes;
        var routes = {};
        var js = 'window.app = window.app || {}; ';
        js = js + 'window.app.routes = window.app.routes || {}; ';

        if (!routesStruc) {
            return;
        }

        _.each(routesStruc, function(pathStruc, route) {
            routes[route] = createRoute(langBundles, pathStruc);
        });

        js = js + 'window.app.routes = ';
        js = js + JSON.stringify(routes) + ';';
        fs.writeFile(projectConfigDir + '/routes.js', js);

        return routes;
    };

    gulp.task('_translate', function() {
        var langBundles = {};
        var langBundle;
        var routes;
        var json;
        var js = 'window.app = window.app || {}; ';
        js = js + 'window.app.locales = window.app.locales || {}; ';

        initDirs();
        _.each(translations, function(lang, name) {
            langBundle = parseLang(lang);
            langBundles[name] = langBundle;

            json = JSON.stringify(langBundle);

            js = js + 'window.app.locales["' + name + '"] = ';
            js = js + json + ';';

            fs.writeFile(localesDir + '/' + name + '.json', json);
        });

        routes = createRoutes(langBundles);

        fs.writeFile(localesDir + '/locales.js', js);

    });

};
