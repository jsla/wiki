var knox = require('knox')
var through = require('through')
var S3Lister = require('s3-lister')

module.exports = function (creds) {
  var client = knox.createClient(creds)

  return {
    client: client,

    getBufferStream: function (key) {
      var stream = through()

      client.getFile(key, function (err, res) {
        if (err) return stream.emit('error', err)

        if (res.statusCode === 404) return stream.end()
        if (res.statusCode !== 200) {
          return stream.emit('error', new Error(res.statusCode))
        }

        res.pipe(stream)
      })

      return stream
    },

    putBuffer: function (key, buf, contentType, cb) {
      console.log('buf.length', buf.length)
      var req = client.put(key, {
        'Content-Length': buf.length,
        'Content-Type': contentType
      })

      req.on('response', function (res) {
        if (res.statusCode === 200) return cb(null, res)
        var err = new Error(res.statusCode)

        return cb(err, res)
      })

      req.end(buf)
    },

    putMarkdown: function (key, str, cb) {
      var req = client.put(key, {
        'Content-Length': Buffer.byteLength(str),
        'Content-Type': 'text/markdown'
      })

      req.on('response', function (res) {
        if (res.statusCode === 200) return cb(null, res)
        var err = new Error(res.statusCode)

        return cb(err, res)
      })

      req.end(str)
    },

    getMarkdown: function (key, cb) {
      console.log('key', key)
      return client.getFile(key, function (err, res) {
        if (err) return cb(err)
        if (res.statusCode === 404) return cb(null)
        if (res.statusCode !== 200) return cb(new Error(res.statusCode))

        var buf = ''
        res.on('error', cb)
        res.on('data', function (chunk) { buf += chunk })
        res.on('end', function () { cb(null, buf.toString()) })
      })
    },

    list: function (prefix) {
      return new S3Lister(client, {prefix: prefix})
    }
  }
}
