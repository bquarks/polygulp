/* global module, require*/

'use strict';

var $ = require('gulp-load-plugins')();
var requireDir = require('require-dir');
var path = require('path');
var _ = require('underscore');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = function(gulp, config) {

    var translations = requireDir(path.resolve('bower_components/translations/web'));
    var localesDir = path.resolve(config.PATHS.dist + '/resources/locales');
    var chars = {
        '{{': '__',
        '}}': '__'
    };

    var replaceChars = function(file) {
        _.each(chars, function(value, key) {
            file = file.replace(new RegExp(key, 'g'), value);
        });
        return file;
    };

    var parseLang = function(terms) {
        var parsedTerms = {};
        _.each(terms, function(term) {
            parsedTerms[term.term] = term.definition;
            if (term.term_plural !== '') {
                parsedTerms[term.term + '_plural'] = term.term_plural;
            }
        });
        return parsedTerms;
    };

    var initDirs = function() {
        mkdirp.sync(localesDir);
    };

    gulp.task('translate', function() {
        var json;
        initDirs();
        _.each(translations, function(lang, name) {
            json = replaceChars(JSON.stringify(parseLang(lang)));
            fs.writeFile(localesDir + '/' + name + '.json', json);
        });
    });

};
