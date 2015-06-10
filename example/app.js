module.exports = App

var Router = require('../index.js')
var BaseElement = require('base-element')
var inherits = require('inherits')

function App (el) {
  if (!(this instanceof App)) return new App(el)
  BaseElement.call(this, el)
  this.router = this.createRouter()
}
inherits(App, BaseElement)

App.prototype.layout = function (content) {
  var h = this.html
  var router = this.router

  function onclick (e) {
    e.preventDefault()
    router.transitionTo(e.target.getAttribute('href'))
  }

  return h('.app', [
    h('nav', [
      h('a', { href: '/', onclick: onclick }, 'home'),
      h('a', { href: '/posts/one', onclick: onclick }, 'posts/one'),
      h('a', { href: '/about.html', onclick: onclick }, 'about')
    ]),
    content
  ])
}

App.prototype.createRouter = function () {
  var h = this.html
  var layout = this.layout.bind(this)
  return new Router({
    '/': function (params, done) {
      return layout([
        'This is the home page',
        h('button', {
          className: 'my-button',
          onclick: function () { window.alert('you did it!') }
        }, 'click me')
      ])
    },
    '/posts/:slug': function (params, done) {
      // TODO: Now it needs to load HTML from static routes
      done(null, layout('page: ' + params.slug))
    },
    '/about.html': function () {
      return layout('about page')
    }
  })
}
