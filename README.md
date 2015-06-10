# blaster
A router for generating a static site that can turn into a single page app.

[![build status](https://secure.travis-ci.org/shama/blaster.svg)](https://travis-ci.org/shama/blaster)
[![NPM version](https://badge.fury.io/js/blaster.svg)](https://badge.fury.io/js/blaster)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/shama.svg)](https://saucelabs.com/u/shama)

## example

```js
var Router = require('blaster')
var createElement = require('base-element')
var fs = require('vinyl-fs')

// Pass routes that return virtual nodes or HTML
var router = new Router({
  '/': function (params, done) {
    return createElement().render(function () {
      return this.html('button', 'click me')
    })
  },
  '/about': function (params, done) {
    done(null, '<strong>about page</strong>')
  }
})

// Generate static pages to the ./dist folder
router.generate().pipe(fs.dest('./dist'))
```

Which will generate the HTML files:

```shell
./dist
├── about.html
└── index.html
```

> See the [example folder](https://github.com/shama/blaster/tree/master/examples)
for a more in depth example.

## api

### `var blaster = new Blaster([routes, options])`
Creates a new instance of `blaster` which inherits
[base-router](https://www.npmjs.com/package/base-router). Please check the docs
there for all available options and methods.

* `routes` - An object literal of routes to create.
* `options` - An object literal to configure operation.

### `router.route(name, model)`
Adds a new route. `name` is the pathname to our route and `model` is a function
that resolves the data for the route.

```js
router.route('/user/:id', function (params, done) {
  done(null, params.id)
})
```

### `router.generate([options])`
Returns a stream of vinyl files for each route.

### `router.generateRoute(route[, options])`
Returns a stream of a vinyl file for the given `route`.

### `router.context(folder[, parseFile])`
Indicates a `folder` with static files to be included. Useful for dynamic
segments in routes such as `/posts/:slug`.

`parseFile` is an optional callback to parse the files as they stream:

```js
router.context('./markdown-files/', function (file, enc, next) {
  file.contents = marked(file.contents)
  this.push(file)
  next()
})
```

## license
(c) 2015 Kyle Robinson Young. MIT License
