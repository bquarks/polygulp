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

    var pluralKeys = {
        zero: 'message_plural_0',
        one: 'message',
        two: 'message_plural_2',
        few: 'message_plural_3',
        many: 'message_plural',
        other: 'message_plural_indefinite'

    };

    var getParsedTerm = function(term, definition) {
        var pluralKey;
        var parsedTermKey;
        var splittedTerm = term.split('_');
        var parsedTerm = {
            key: term,
            value: {}
        };

        if (!_.has(pluralKeys, _.last(splittedTerm))){
            parsedTerm.value.message = definition;
            return parsedTerm;
        }

        parsedTermKey = term.replace('_' + _.last(splittedTerm), '');
        pluralKey = pluralKeys[_.last(splittedTerm)];
        parsedTerm.key = parsedTermKey;
        parsedTerm.value[pluralKey] = definition;

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
