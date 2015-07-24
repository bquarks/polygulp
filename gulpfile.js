'use strict';

/* global module, require */

var $ = require('gulp-load-plugins')();
var del = require('del');

var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var historyApiFallback = require('connect-history-api-fallback');

var customMedia = require("postcss-custom-media");
var nested = require('postcss-nested');
var autoprefixer = require('autoprefixer');
var extend = require('deep-extend');
var atImport = require("postcss-import");

var requireDir = require('require-dir');
var path = require('path');
var _ = require('underscore');
var mkdirp = require('mkdirp');

module.exports = function(gulp, appSettings) {

var runSequence = require('run-sequence').use(gulp);

    var config = {
        path: {
            app: 'app/',
            dist: 'dist/',
            test: 'test/',
            translations: 'bower_components/translations/clients/web'
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
        ]
    };

    var options = {
        vulcanize: {
            stripComments: true,
            inlineCss: true,
            inlineScripts: true
        }
    };

    // translate
    var translations = requireDir(path.resolve(config.path.translations));
    var localesDir = path.resolve('.tmp/resources/locales');
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
            term.term =  replaceChars(term.term);
            parsedTerms[term.term] = {
                description: "",
                message: term.definition
            };
            if (term.term_plural !== '') {
                parsedTerms[term.term + '_plural'] = {
                    description: "",
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

    var styleTask = function(stylesPath, srcs) {
        return gulp.src(srcs.map(function(src) {
                return path.join(config.path.app, stylesPath, src);
            }))
            .pipe($.changed(stylesPath, {
                extension: '.css'
            }))
            .pipe($.postcss(config.postcssProcessors))
            .pipe(gulp.dest('.tmp/' + stylesPath))
            .pipe($.if('*.css', $.cssmin()))
            .pipe(gulp.dest('dist/' + stylesPath))
            .pipe($.size({
                title: stylesPath
            }));
    };

    // Compile and Automatically Prefix Stylesheets
    gulp.task('styles', function() {
        return styleTask('styles', ['**/*.css']);
    });

    gulp.task('elements', function() {
        return styleTask('elements', ['**/*.css']);
    });

    gulp.task('pages', function() {
        return styleTask('pages', ['**/*.css']);
    });

    // Lint JavaScript
    gulp.task('jshint', function() {
        return gulp.src([
                config.path.app + 'elements/**/*.js',
                config.path.app + 'pages/**/*.js',
                config.path.app + 'routes/**/*.js',
                config.path.app + 'main/**/*.js'
            ])
            .pipe(reload({
                stream: true,
                once: true
            }))
            .pipe($.jshint.extract()) // Extract JS from .html files
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
    });

    // Optimize Images
    gulp.task('images', function() {
        return gulp.src(config.path.app + 'assets/**/*')
            .pipe($.cache($.imagemin({
                progressive: true,
                interlaced: true
            })))
            .pipe(gulp.dest(config.path.dist + 'assets/'))
            .pipe($.size({
                title: 'images'
            }));
    });

    gulp.task('svgsprite', function() {
        del.sync(config.path.dist + 'assets/svg/sprite.svg');
         gulp.src(config.path.app + 'assets/svg/sprite/*.svg')
            .pipe($.svgstore())
            .pipe(gulp.dest(config.path.dist + 'assets/svg'));
    });

    // Copy All Files At The Root Level (app)
    gulp.task('copy', function() {
        var app = gulp.src([
            'app/*',
            '!app/test',
            '!app/precache.json'
        ], {
            dot: true
        }).pipe(gulp.dest('dist'));

        var bower = gulp.src([
            'bower_components/**/*'
        ]).pipe(gulp.dest('dist/bower_components'));

        var elements = gulp.src([config.path.app + 'elements/**/*.html'])
            .pipe(gulp.dest(config.path.dist + 'elements'));

        var scripts = gulp.src([config.path.app + '/**/*.js'])
            .pipe(gulp.dest(config.path.dist));

        var resources = gulp.src(['.tmp/resources/locales/**/*'])
            .pipe(gulp.dest(config.path.dist + 'resources/locales'));

        // var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
        //     .pipe(gulp.dest('dist/elements/bootstrap'));
        //
        // var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
        //     .pipe(gulp.dest('dist/sw-toolbox'));



        return merge(app, bower, elements, resources, scripts)
            .pipe($.size({
                title: 'copy'
            }));
    });

    // Copy Web Fonts To Dist
    gulp.task('fonts', function() {
        return gulp.src(['app/fonts/**'])
            .pipe(gulp.dest('dist/fonts'))
            .pipe($.size({
                title: 'fonts'
            }));
    });

    // Scan Your HTML For Assets & Optimize Them
    gulp.task('html', function() {
        var assets = $.useref.assets({
            searchPath: ['.tmp', 'app', 'dist']
        });

        return gulp.src([config.path.app + '**/*.html', '!{elements, routes, pages, main, test}/**/*.html'])
            // Replace path for vulcanized assets
            .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html'))) // TODO
            .pipe(assets)
            // Concatenate And Minify JavaScript
            .pipe($.if('*.js', $.uglify({
                preserveComments: 'some'
            })))
            // Concatenate And Minify Styles
            // In case you are still using useref build blocks
            .pipe($.if('*.css', $.cssmin()))
            .pipe(assets.restore())
            .pipe($.useref())
            // Minify Any HTML
            .pipe($.if('*.html', $.minifyHtml({
                quotes: true,
                empty: true,
                spare: true
            })))
            // Output Files
            .pipe(gulp.dest(config.path.dist))
            .pipe($.size({
                title: 'html'
            }));
    });

    // Vulcanize imports
    gulp.task('vulcanize', function() {

        var imports = gulp.src(config.path.dist + 'main/imports.html')
            .pipe($.vulcanize(options.vulcanize))
            .pipe(gulp.dest(config.path.dist + 'main'))
            .pipe($.size({
                title: 'vulcanize:imports'
            }));

        var routes = gulp.src(config.path.dist + 'routes/routes.html')
            .pipe($.vulcanize(options.vulcanize))
            .pipe(gulp.dest(config.path.dist + 'routes'))
            .pipe($.size({
                title: 'vulcanize:routes'
            }));

        return merge(imports, routes);
    });

    // Generate a list of files that should be precached when serving from 'dist'.
    // The list will be consumed by the <platinum-sw-cache> element.
    gulp.task('precache', function(callback) {
        var dir = 'dist';

        glob('{elements,scripts,styles}/**/*.*', {
            cwd: dir
        }, function(error, files) {
            if (error) {
                callback(error);
            } else {
                files.push('index.html', './', 'bower_components/webcomponentsjs/webcomponents-lite.min.js');
                var filePath = path.join(dir, 'precache.json');
                fs.writeFile(filePath, JSON.stringify(files), callback);
            }
        });
    });

    // Clean Output Directory
    gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

    // Watch Files For Changes & Reload
    gulp.task('serve', ['styles', 'elements', 'pages', 'images', '_translate'], function() {
        browserSync({
            notify: false,
            logPrefix: 'PSK',
            snippetOptions: {
                rule: {
                    match: '<span id="browser-sync-binding"></span>',
                    fn: function(snippet) {
                        return snippet;
                    }
                }
            },
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: {
                baseDir: ['.tmp', 'app'],
                middleware: [historyApiFallback()],
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });

        gulp.watch(['app/**/*.html'], reload);
        gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
        gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
        gulp.watch(['app/{scripts,elements}/**/*.js'], ['jshint']);
        gulp.watch(['app/images/**/*'], reload);
    });

    // Build and serve the output from the dist build
    gulp.task('serve:dist', ['default'], function() {
        browserSync({
            notify: false,
            logPrefix: 'PSK',
            snippetOptions: {
                rule: {
                    match: '<span id="browser-sync-binding"></span>',
                    fn: function(snippet) {
                        return snippet;
                    }
                }
            },
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: 'dist',
            middleware: [historyApiFallback()]
        });
    });

    // Build Production Files, the Default Task
    gulp.task('default', ['clean'], function(cb) {
        runSequence(
            '_translate',
            ['copy', 'styles'],
            ['elements', 'pages'], ['jshint', 'images', 'svgsprite', 'fonts', 'html'],
            'vulcanize',
            cb);
        // Note: add , 'precache' , after 'vulcanize', if your are going to use Service Worker
    });

    // Load tasks for web-component-tester
    // Adds tasks for `gulp test:local` and `gulp test:remote`
    require('web-component-tester').gulp.init(gulp);

    // Load custom tasks from the `tasks` directory
    try {
        require('require-dir')('tasks');
    } catch (err) {}

    // Merge user settings with default config

};
