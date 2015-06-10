var app = require('./app.js')(document.body)

app.router.on('transition', function (route, content) {
  console.log('transition to', route)
  app.render(function () {
    return this.html('.container', content)
  })
})

// Clear out static and start it up
// document.body.innerHTML = ''
// app.router.transitionTo(location.hash)
