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

function Blaster (routes, opts) {
  if (!(this instanceof Blaster)) return new Blaster(routes, opts)
  BaseRouter.call(this, {}, opts)
  var self = this
  opts = opts || {}
  this.ext = opts.ext || '.html'
  this.validateRoute = opts.validateRoute || /\:|\(\|/
  this._routes = []
  this._context = null
  if (routes) {
    Object.keys(routes).forEach(function Blaster_forEachRoutes (key) {
      self.route(key, routes[key])
    })
  }
}
inherts(Blaster, BaseRouter)

Blaster.prototype.route = function Blaster_route (route, fn) {
  var model = function () {
    var args = Array.prototype.slice.call(arguments)
    return fn.apply(fn, args)
  }
  this._routes.push(route)
  return BaseRouter.prototype.route.call(this, route, model.bind(this))
}

Blaster.prototype.generate = function Blaster_generate (opts) {
  var self = this
  var stream = ms()
  this._routes.forEach(function (route) {
    if (self.validateRoute.test(route)) return
    stream.add(self.generateRoute(route, opts))
  })
  stream.add(this._renderStatic())
  return stream
}

Blaster.prototype.generateRoute = function Blaster_generateRoute (route, opts) {
  var self = this
  opts = opts || {}
  opts.routeToPath = opts.routeToPath || this.routeToPath.bind(this)
  var stream = through.obj()
  this.transitionTo(route, function Blaster_transitionTo (err, contents) {
    if (err) return stream.emit('error', err)
    var file = new File({
      path: opts.routeToPath(route),
      contents: self._toContents(contents)
    })
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

Blaster.prototype.context = function Blaster_context (context, parseFile) {
  if (typeof parseFile !== 'function') {
    parseFile = function Blaster_parseFile (file, enc, next) {
      this.push(file)
      next()
    }
  }
  this._context = [context, parseFile]
}

Blaster.prototype._toContents = function Blaster_toContents (contents) {
  if (contents instanceof Buffer) {
    return contents
  }
  if (typeof contents === 'string') {
    return new Buffer(contents)
  }
  // TODO: Detect if vnode/vtree?
  return new Buffer(toHTML(contents))
}

Blaster.prototype._renderStatic = function Blaster_renderStatic () {
  if (!this._context) return through.obj()
  var stream = through.obj(this._context[1])
  var cwd = this._context[0]
  glob('**/*', { cwd: cwd, nodir: true }, function Blaster_glob (err, files) {
    if (err) return stream.emit('error', err)
    var len = files.length
    files.forEach(function (filepath) {
      readFile(filepath, function () {
        len--
        if (len < 0) stream.end()
      })
    })
  })
  function readFile (filepath, next) {
    fs.readFile(path.resolve(cwd, filepath), function Blaster_readFile (err, src) {
      if (err) return stream.emit('error', err)
      stream.write(new File({
        path: filepath,
        contents: src
      }))
      next()
    })
  }
  return stream
}
