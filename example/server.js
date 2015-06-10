var path = require('path')

var vfs = require('vinyl-fs')
var browserify = require('browserify')
var marked = require('marked')
var yfm = require('yfm')
var through = require('through2')

var app = require('./app.js')()

// Add server only routes
app.router.route('/bundle.js', function (params, done) {
  var b = browserify()
  b.add(path.resolve(__dirname, 'browser.js'))
  b.bundle(done)
})
app.router.route('/style.css', function (params, done) {
  return 'body { background-color: red; }'
})

// Specify the context of this router
// Also can parse files as they are written
app.router.context(path.resolve(__dirname, 'src'), function (file, enc, next) {
  // Such as renaming and converting markdown
  file.path = file.path.slice(0, -3)
  file.contents = new Buffer(marked(file.contents.toString()))
  this.push(file)
  next()
})

// Wrap static site in template and write to ./dist folder
app.router.generate()
  .pipe(through.obj(function (file, enc, next) {
    if (path.extname(file.path) === app.router.ext) {
      file.contents = new Buffer([
        '<html>',
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
