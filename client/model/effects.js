const http = require('choo/http')
const auth = require('../authentic')

module.exports = {
  fetch: (id, state, send, done) => {
    var url = '/docs/' + id

    var opts = {
      headers: {
        Authorization: 'Bearer ' + auth.getAuthToken()
      }
    }

    send('setLoading', true, function () {})
    http(url, opts, (err, res, body) => {
      if (err) return done(err)
      if (res.statusCode >= 400) {
        auth.logout()
        window.location.reload()
      }

      send('receiveDoc', {id: id, body: body}, done)
      send('setLoading', false, function () {})
    })
  },

  save: (data, state, send, done) => {
    var url = '/docs/' + state.id
    var opts = {
      body: state.localDoc,
      headers: {
        Authorization: 'Bearer ' + auth.getAuthToken()
      }
    }

    send('setLoading', true, function () {})
    http.post(url, opts, (err, res, body) => {
      if (err) return done(err)
      if (res.statusCode === 401) {
        auth.logout()
        window.location.reload()
      }

      send('receiveDoc', {id: state.id, body: state.localDoc}, done)
      send('setLoading', false, function () {})
      send('setEditing', false, function () {})
    })
  },

  uploadImage: (data, state, send, done) => {
    var file = data.file
    var cursorPosition = data.cursorPosition

    var url = '/images/' + state.id + '/' + file.name
    var opts = {
      body: file,
      headers: {
        Authorization: 'Bearer ' + auth.getAuthToken(),
        'Content-Type': file.type
      }
    }

    http.post(url, opts, function (err, res, body) {
      if (err) return console.error(err)

      send('insertImage', {url: body, cursorPosition: cursorPosition}, done)
    })
  }
}
