// This runs only on the browser
// Used for startup type things

var app = require('./app.js')(document.body)

// Clear out existing app if one rendered server side
var existing = document.querySelector('.app')
if (existing.parentNode) existing.parentNode.removeChild(existing)

// Main render
app.router.on('transition', function (route, content) {
  app.render(content)
})

// Initial render
app.render(app.html('.loading', 'Loading...'))

// Default browser side route
app.router.transitionTo(document.location.pathname)
