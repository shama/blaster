var Router = require('../index.js')
var createElement = require('base-element')
var toHTML = require('vdom-to-html')

module.exports = function (el) {
  var app = createElement(el)
  var h = app.html

  function container (content) {
    return h('.container', [
      h('nav', [
        h('a', { href: '/' }, 'home'),
        h('a', { href: '/posts/one' }, 'posts/one'),
        h('a', { href: '/about.html' }, 'about')
      ]),
      content
    ])
  }

  app.router = new Router({
    // layout: function (content) {
    //   //return toHTML(container('!!CONTENT!!')).replace('!!CONTENT!!', content.toString())
    //   return content
    // },
    '/': function (params, done) {
      return container(h('button', {
        className: 'my-button',
        onclick: function () {
          alert('you did it!')
        }
      }, 'click me'))
    },
    '/posts/:slug': function (params, done) {
      done(null, container('page: ' + params.slug))
    },
    '/about.html': function () {
      return container('about page')
    }
  })

  return app
}
