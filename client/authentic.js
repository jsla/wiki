const Authentic = require('authentic-ui')

const aui = Authentic({
  server: 'https://authentic.apps.js.la',
  links: {
    signup: '#/signup',
    login: '#/login',
    changePasswordRequest: '#/change-password-request'
  }
})

module.exports = {
  getAuthToken: aui.authToken.bind(aui),

  logout: function () {
    aui.logout()
    setTimeout(function () {
      window.location.hash = '/'
    }, 20)
    return document.createElement('div')
  },

  login: function (state, prev) {
    if (prev.location) window.location.reload()

    return aui.login(function (err, result) {
      if (err) console.error(err)
      window.location.hash = '/'
    })
  },

  signup: function (state, prev) {
    if (prev.location) window.location.reload()

    var urlTemplate = window.location.origin + '#/confirm/<%= email %>/<%= confirmToken %>'
    var bodyTemplate = `
      <h1>js.la Accounts</h1>
      <p>Thanks for signing up! Please <a href="${urlTemplate}">confirm your account</a> to continue.
      </p>
    `

    return aui.signup({
      from: 'js.la Accounts <accounts@js.la>',
      subject: 'Your js.la Account',
      confirmUrl: urlTemplate,
      provide: { bodyTemplate: bodyTemplate }
    })
  },

  confirm: function (state) {
    var params = state.params
    return aui.confirm({
      email: params.email,
      confirmToken: params.token,
      confirmDelay: 5000
    }, function onLogin (err, result) {
      if (err) console.error(err)
      // logged in, now redirect to main content
      window.location.hash = '/'
    })
  },

  changePasswordRequest: function (state, prev) {
    if (prev.location) window.location.reload()

    var urlTemplate = window.location.origin + '#/change-password/<%= email %>/<%= changeToken %>'
    var bodyTemplate = `
      <h1>js.la: Password Change</h1>
      <p>
        We received your request to change your password. Please <a href="${urlTemplate}">choose a new password</a> to continue.
      </p>
    `

    return aui.changePasswordRequest({
      from: 'js.la Accounts <accounts@js.la>',
      subject: 'js.la Password Reset',
      changeUrl: urlTemplate,
      provide: { bodyTemplate: bodyTemplate }
    })
  },

  changePassword: function (state) {
    var params = state.params

    return aui.changePassword({
      email: params.email,
      changeToken: params.token,
      confirmDelay: 5000
    }, function onLogin (err, result) {
      if (err) console.error(err)
      // password changed and logged in, now redirect to main content
      window.location.hash = '/'
    })
  }
}
