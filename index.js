module.exports = Blaster

var path = require('path')
var inherts = require('inherits')
var BaseRouter = require('base-router')
var through = require('through2')
var ms = require('merge-stream')
var File = require('vinyl')
var toHTML = require('vdom-to-html')
var glob = require('glob')
var fs = require('fs')
var xtend = require('xtend')

function noop (contents) { return contents }

function Blaster (routes, opts) {
  if (!(this instanceof Blaster)) return new Blaster(routes, opts)
  BaseRouter.call(this, {}, opts)
  var self = this
  opts = opts || {}
  this.ext = opts.ext || '.html'
  this.validateRoute = opts.validateRoute || /\:|\(\|/
  this.layoutName = opts.layoutName || 'layout'
  this._layoutFn = noop
  this._routes = Object.create(null)
  this._context = null
  if (routes) {
    Object.keys(routes).forEach(function Blaster_forEachRoutes (key) {
      self.route(key, routes[key])
    })
  }
}
inherts(Blaster, BaseRouter)

Blaster.prototype.route = function Blaster_route (route, fn, opts) {
  var model = function () {
    var args = Array.prototype.slice.call(arguments)
    return fn.apply(fn, args)
  }
  if (route === this.layoutName) {
    this._layoutFn = fn
    return
  }
  this._routes[route] = opts
  return BaseRouter.prototype.route.call(this, route, model.bind(this))
}

Blaster.prototype.generate = function Blaster_generate (opts) {
  var self = this
  var stream = ms()
  Object.keys(this._routes).forEach(function (route) {
    if (self.validateRoute.test(route)) return
    stream.add(self.generateRoute(route, xtend({}, opts, self._routes[route])))
  })
  stream.add(this._renderStatic())
  return stream
}

Blaster.prototype.generateRoute = function Blaster_generateRoute (route, opts) {
  var self = this
  opts = opts || {}
  opts.routeToPath = opts.routeToPath || this.routeToPath.bind(this)
  opts.toHTML = opts.toHTML || this.toHTML.bind(this)
  var layout = this._getLayout()
  var stream = through.obj()
  this.transitionTo(route, function (err, contents) {
    var file = new File({
      path: opts.routeToPath(route),
      contents: opts.toHTML(contents)
    })
    if (path.extname(file.path) === self.ext) {
      file.contents = layout(file.contents)
    }
    stream.end(file)
  })
  return stream
}

Blaster.prototype.routeToPath = function Blaster_routeToPath (route) {
  if (route === '/') route = 'index'
  if (route.slice(0, 1) === '/') route = route.slice(1)
  if (path.extname(route) === '') route += this.ext
  return route
}

Blaster.prototype.toHTML = function Blaster_toHTML (contents) {
  if (contents instanceof Buffer) {
    return contents
  }
  if (typeof contents === 'string') {
    return new Buffer(contents)
  }
  // TODO: Detect if vnode/vtree?
  return new Buffer(toHTML(contents))
}

Blaster.prototype.context = function (context, parseFile) {
  if (typeof parseFile !== 'function') {
    parseFile = function (file, enc, next) {
      this.push(file)
      next()
    }
  }
  this._context = [context, parseFile]
}

Blaster.prototype._renderStatic = function () {
  var self = this
  if (!this._context) return through.obj()
  var layout = this._getLayout()
  var stream = through.obj(this._context[1])
  var cwd = this._context[0]
  glob('**/*', { cwd: cwd, nodir: true }, function (err, files) {
    var len = files.length
    files.forEach(function (filepath) {
      readFile(filepath, function () {
        len--
        if (len < 0) stream.end()
      })
    })
  })
  function readFile (filepath, next) {
    fs.readFile(path.resolve(cwd, filepath), function (err, src) {
      if (err) return stream.emit('error', err)
      stream.write(new File({
        path: filepath,
        contents: src
      }))
      next()
    })
  }
  return stream.pipe(through.obj(function (file, enc, next) {
    if (path.extname(file.path) === self.ext) {
      file.contents = layout(file.contents)
    }
    this.push(file)
    next()
  }))
}

Blaster.prototype._getLayout = function (opts) {
  opts = opts || {}
  if (opts.layout === false) {
    return noop
  }
  var layout = (typeof opts.layout === 'function') ? opts.layout : this._layoutFn
  return function (contents) {
    return new Buffer(layout(contents.toString()))
  }
}
