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

#### gulp serve
Runs server for development.

#### gulp release
Bumps bower & package version, commits changed files and creates a new tag with the specified version.

task                        | version
----------------------------|-----------------
gulp release --patch        | v0.0.1 -> v0.0.2
gulp release --minor        | v0.0.1 -> v0.1.0
gulp release --major        | v0.0.1 -> v1.0.1
gulp release --version 1.1.1| v0.0.1 -> v1.1.1

Task targets, files and options may be specified according to the gulp [Recipes](https://github.com/gulpjs/gulp/tree/master/docs/recipes) guide.
