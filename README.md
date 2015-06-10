# blaster
A virtualized static/dynamic site generator.

[![build status](https://secure.travis-ci.org/shama/blaster.svg)](https://travis-ci.org/shama/blaster)
[![NPM version](https://badge.fury.io/js/blaster.svg)](https://badge.fury.io/js/blaster)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/shama.svg)](https://saucelabs.com/u/shama)

## example

```js
var Blaster = require('./index.js')
var createElement = require('base-element')
var fs = require('vinyl-fs')

// Pass routes that return virtual nodes or HTML
var blaster = new Blaster({
  '/': function (params, done) {
    return createElement().render(function () {
      return this.html('button', 'click me')
    })
  },
  '/about': function (params, done) {
    done(null, '<strong>about page</strong>')
  }
})

// Generate static pages
blaster.generate().pipe(fs.dest('./dest'))
```

## api

### `var router = new BaseRouter([routes, options])`
Creates a new instance of `blaster`.

* `routes` - An object literal of routes to create.
* `options` - An object literal to configure:
  * `location` - Whether to manage the `window.location`. If
  `window.history.pushState` is available it will use that otherwise it will use
  `window.location.hash`. Set to `false` to disable, `hash` to force using
  hashes, and `history` to force using push state.

### `router.route(name, model)`
Adds a new route. `name` is the pathname to our route and `model` is a function
that resolves the data for the route.

```js
router.route('/user/:id', function (params, done) {
  done(null, params.id)
})
```

### `router.transitionTo(name[, params])`
Transitions to the given route `name`.

Optionally you can supply `params` to override the params given to a route.

### `router.currentRoute`
The last resolved route we are currently on.

### Events

#### `.on('transition', function (name, data) {})`
When a transition has resolved. Gives the `name` of the route and the `data`
that has been resolved by the model.

#### `.on('loading', function (name, abort) {})`
Indicates the desire to transition into a route with `name` but model has not
yet resolved.

Call `abort()` to abort the transition.

#### `.on('error', function (name, err) {})`
When a transition has errored. Gives the `name` of the route and the `err`
that has been either thrown, first argument of callback or rejected by the
promise.

## license
(c) 2015 Kyle Robinson Young. MIT License
