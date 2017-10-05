var s3 = require('./s3')
var map = require('map-async')
var config = require('../config')

var db = s3(config.s3)

module.exports = {
  get: get,
  put: put,
  getDocStream: getDocStream,
  getImageStream: getImageStream,
  putImage: putImage
}

function get (name, cb) {
  var key = createKeys(name).latest
  db.getMarkdown(key, cb)
}

function put (name, content, cb) {
  var okeys = createKeys(name)
  var keys = [okeys.latest, okeys.snapshot]

  map(keys, putDoc, cb)

  function putDoc (key, cb) { db.putMarkdown(key, content, cb) }
}

function getDocStream (name) {
  var key = createKeys(name).latest
  return db.getBufferStream(key)
}

function getImageStream (key) {
  return db.getBufferStream(key)
}

function putImage (opts, cb) {
  var doc = opts.doc
  var body = opts.body
  var filename = opts.filename
  var contentType = opts.contentType

  var key = createImageKey(doc, filename)

  db.putBuffer(key, body, contentType, function (err) {
    if (err) return cb(err)
    cb(null, key)
  })
}

function createKeys (name) {
  var date = new Date().toISOString().slice(0, 19)
  return {
    latest: ['latest', name].join('/') + '.md',
    snapshot: ['snapshots', name, date].join('/') + '.md'
  }
}

function createImageKey (doc, filename) {
  var date = new Date().toISOString().slice(0, 19)
  return ['images', doc, [date, filename].join('_')].join('/')
}
