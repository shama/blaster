var Blaster = require('../index.js')
var path = require('path')
var test = require('tape')

test('generate routes', function (t) {
  t.plan(3)
  var router = new Blaster({
    '/': function () { return 'index' },
    '/about.html': function (params, done) { done(null, 'about') },
    '/bundle.js': function () { return 'var test = true' }
  })
  streamContains(router.generate(), function (result) {
    t.equal(result['index.html'], 'index')
    t.equal(result['about.html'], 'about')
    t.equal(result['bundle.js'], 'var test = true')
    t.end()
  })
})

test('specify files', function (t) {
  t.plan(3)
  var router = new Blaster({
    '/': function () { return 'index' }
  })
  router.files(path.resolve(__dirname, 'fixtures'))
  streamContains(router.generate(), function (result) {
    t.equal(result['index.html'], 'index')
    t.equal(result['posts.html'], 'posts\n')
    t.equal(result['posts/one.html'], 'one\n')
    t.end()
  })
})

function streamContains (stream, done) {
  var result = Object.create(null)
  stream.on('data', function (file) {
    result[file.path] = file.contents.toString()
  })
  stream.on('end', function () {
    done(result)
  })
}
