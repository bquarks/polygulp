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
    var chars = {
        '{{': '__',
        '}}': '__'
    };

    var replaceChars = function(term) {
        _.each(chars, function(value, key) {
            term = term.replace(new RegExp(key, 'g'), value);
        });
        return term;
    };

    var parseLang = function(terms) {
        var parsedTerms = {};
        _.each(terms, function(term) {
            term.term = replaceChars(term.term);
            parsedTerms[term.term] = {
                description: '',
                message: term.definition
            };
            if (term.term_plural !== '') {
                parsedTerms[term.term + '_plural'] = {
                    description: '',
                    message: term.term_plural
                };
            }
        });
        return parsedTerms;
    };

    var initDirs = function() {
        mkdirp.sync(localesDir);
    };

    gulp.task('_translate', function() {
        var json;
        initDirs();
        _.each(translations, function(lang, name) {
            json = JSON.stringify(parseLang(lang));
            fs.writeFile(localesDir + '/' + name + '.json', json);
        });
    });

};
