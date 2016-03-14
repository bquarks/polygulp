# polygulp

> Indirect gulpfile for Polymer applications.


## Getting Started

If you haven't used [Gulp](http://gulpjs.com/) before, be sure to check out the [Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) guide and how to use Gulp plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install polygulp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gulpfile with this line of JavaScript:

```js
module.exports = function(gulp) {

    // Init main modular gulpfile
    var gulp = require('gulp');

    require('polygulp')(gulp);

};
```


## Usage

### Tasks

#### gulp serve
Runs server for development.

#### gulp serve:dist
Runs server displaying optimized application for production.

#### gulp dist
Generates optimized application for production in `dist` folder.

You can use custom configuration using command line in ```gulp serve```, ```gulp serve:dist```, ```gulp dist``` and default tasks:

##### Custom environment
Provide environment variable by command line to use environment config.json if exits in main project.

```
gulp --environment=integration
```

##### Custom endpoints configuration
Provide endpoints variables by command line to use them instead those provided in config.json.

```
gulp --endpoint.urlBase=https://my-url-base/{{module}}/ --endpoint.version=v1 --endpoint.domain=my:domain
```

#### gulp release
Bumps bower & npm version, commits changed files and creates a new tag with the specified version.

> NOTE: You must specific a branch name with --branch

task                                             | version
-------------------------------------------------|-----------------
gulp release --patch --branch branchName         | v0.0.1 -> v0.0.2
gulp release --minor --branch branchName         | v0.0.1 -> v0.1.0
gulp release --major --branch branchName         | v0.0.1 -> v1.0.1
gulp release --version 1.1.1 --branch branchName | v0.0.1 -> v1.1.1

Task targets, files and options may be specified according to the gulp [Recipes](https://github.com/gulpjs/gulp/tree/master/docs/recipes) guide.

### Configuration

You can provide a default config file in ```app/resources/config/config.json``` and polygulp will set an object in app.common.config namespace.

app/resources/config/config.json:
```json
{
    "debug": "true",
    "appName": "my-app-name",
    "version": "0.0.1",
    "analyticsID": ["UA-XXXXXXXX-YY"],
    "smartBanner": {
        "id": "com.my.app",
        "daysHidden": 15,
        "daysReminder": 90
        },
    "backend": {
        "urlBase": "https://my-url-base/{{module}}/",
        "version": "v8",
        "domain": "my:domain",
        "endpoints": {
            "login": "loginuser",
            "logout": "logoutuser",
            "feedback": "feedback"
        }
    },
    "webfs": {
        "name": "webfs",
        "version": "v1.0",
        "domain": "/books:Book/"
    },
    "routes": {
        "home": "/route_home",
        "movie": "/route_movie/:id"
    }
}
```

Provide environment config files to extend the default config file.

app/resources/config/{{my-environment}}/config.json:
```json
{
    "analyticsID": ["UA-ZZZZZZZ-YY"],
    "smartBanner": {
        "id": "com.my.another.app"
        },
    "backend": {
        "urlBase": "https://my-environment-url-base/{{module}}/",
        "version": "v10",
        "domain": "my:another:domain"
    }
}
```
