// This runs only on the server
// Used to generate static pages

var path = require('path')
var fs = require('fs')

var vfs = require('vinyl-fs')
var browserify = require('browserify')
var marked = require('marked')
var through = require('through2')
var toHTML = require('vdom-to-html')
var convertHTML = require('html-to-vdom')({
  VNode: require('virtual-dom/vnode/vnode'),
  VText: require('virtual-dom/vnode/vtext')
})

var app = require('./app.js')()

// Add server only routes
app.router.route('/bundle.js', function (params, done) {
  var b = browserify()
  b.add(path.resolve(__dirname, 'browser.js'))
  b.bundle(done)
})
app.router.route('/style.css', function (params, done) {
  fs.readFile(path.resolve(__dirname, 'style.css'), function (err, file) {
    if (err) return done(err)
    done(null, file.toString())
  })
})

// Specify the context of this router
// Also can parse files as they are written
app.router.files(path.resolve(__dirname, 'src'), function (file, enc, next) {
  // Such as renaming and converting markdown
  file.path = file.path.slice(0, -3)
  var contents = convertHTML('<div>' + marked(file.contents.toString()) + '</div>')
  contents = toHTML(app.layout(contents))
  file.contents = new Buffer(contents)
  this.push(file)
  next()
})

// Wrap static site in template and write to ./dist folder
app.router.generate()
  .pipe(through.obj(function (file, enc, next) {
    if (path.extname(file.path) === app.router.ext) {
      file.contents = new Buffer([
        '<html>',
        '<head>',
        '<link rel="stylesheet" href="/style.css" type="text/css" media="screen" charset="utf-8">',
        '</head>',
        '<body>',
        file.contents,
        '<script src="/bundle.js"></script>',
        '</body>',
        '</html>'
      ].join('\n'))
    }
    this.push(file)
    next()
  }))
  .pipe(vfs.dest('./dist'))
