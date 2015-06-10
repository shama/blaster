var Blaster = require('../index.js')
var path = require('path')
var test = require('tape')
var through = require('through2')

test('generate routes', function (t) {
  t.plan(6)
  var router = new Blaster({
    '/': function () { return 'index' },
    '/about.html': function (params, done) { done(null, 'about') },
    '/bundle.js': function () { return 'var test = true' }
  })
  streamContains(router.generate(), function (result) {
    t.equal(result[0].path, 'index.html')
    t.equal(result[0].contents.toString(), 'index')
    t.equal(result[1].path, 'about.html')
    t.equal(result[1].contents.toString(), 'about')
    t.equal(result[2].path, 'bundle.js')
    t.equal(result[2].contents.toString(), 'var test = true')
    t.end()
  })
})

test('specify files', function (t) {
  t.plan(6)
  var router = new Blaster({
    '/': function () { return 'index' },
  })
  router.files(path.resolve(__dirname, 'fixtures'))
  streamContains(router.generate(), function (result) {
    t.equal(result[0].path, 'index.html')
    t.equal(result[0].contents.toString(), 'index')
    t.equal(result[1].path, 'posts.html')
    t.equal(result[1].contents.toString(), 'posts\n')
    t.equal(result[2].path, 'posts/one.html')
    t.equal(result[2].contents.toString(), 'one\n')
    t.end()
  })
})

function streamContains (stream, done) {
  var result = []
  stream.on('data', function (file) { result.push(file) })
  stream.on('end', function () { done(result) })
}
