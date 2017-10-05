var version = require('../package.json').version

var bl = require('bl')
var http = require('http')
var body = require('body')
var path = require('path')
var xtend = require('xtend')
var health = require('health-route')
var router = require('http-hash-router')()
var logger = require('req-logger')({version: version})
var ecstatic = require('ecstatic')
var validator = require('validator')
var Authentic = require('authentic-service')
var AsyncCache = require('async-cache')

var db = require('./db')
var config = require('../config')

var auth = Authentic(config.authentic)

var accessCache = new AsyncCache({
  load: function (k, cb) {
    db.get('_access', function (err, doc) {
      console.log('err', err)
      if (err) return cb(err)
      doc = doc || ''
      var list = doc
        .split('\n')
        .map(function (line) {
          return line
            .toLowerCase()
            .replace(/^\s*\*\s+/, '')
        })
        .filter(function (line) { return validator.isEmail(line) })
      cb(null, list)
    })
  },
  maxAge: 15 * 60 * 1000
})

var es = ecstatic({
  showDir: false,
  root: path.join(__dirname, '/../public'),
  handleError: false,
  serverHeader: false
})

module.exports = function () {
  router.set('/', main)
  router.set('/docs/:name', {
    GET: authify(getDoc),
    POST: authify(putDoc)
  })
  router.set('/images/:doc/:name', {
    GET: getImage,
    POST: authify(putImage)
  })
  router.set('/icon16.png', empty)
  router.set('/favicon.ico', empty)
  router.set('/404', notFound)

  return http.createServer(function (req, res) {
    if (req.url === '/health') return health(req, res)

    logger(req, res, {headers: xtend(req.headers, {authorization: undefined, cookie: undefined})})
    es(req, res, function () { router(req, res, {}, onError) })

    function onError (err) {
      if (!err) return

      console.error({err: err, requestId: req.id}, err.message)
      res.statusCode = err.statusCode || 500
      res.end('Error')
    }
  })
}

function main (req, res, opts) {
  var title = 'Wiki'
  var html = [
    '<html><head><title>' + title + '</title>',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<link rel="icon" type="image/png" href="/icon16.png"></head>',
    '<body><script src="main.js?v=' + version + '"></script></body></html>'
  ].join('')
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(html)
}

function getDoc (req, res, opts) {
  res.statusCode = 200
  db.getDocStream(opts.params.name).pipe(res)
}

function putDoc (req, res, opts) {
  body(req, res, function (err, content) {
    if (err) return sendError(req, res, err)

    db.put(opts.params.name, content, function (err) {
      if (err) return sendError(req, res, err)
      res.statusCode = 200
      res.end('OK')
    })
  })
}

function getImage (req, res, opts) {
  res.statusCode = 200
  db.getImageStream(req.url).pipe(res)
}

function putImage (req, res, opts) {
  opts = {
    doc: opts.params.doc,
    filename: opts.params.name,
    contentType: req.headers['content-type']
  }

  req.pipe(bl(function (err, buf) {
    if (err) return sendError(req, res, err)

    opts.body = buf
    db.putImage(opts, function (err, url) {
      if (err) return sendError(req, res, err)

      res.statusCode = 200
      res.end(url)
    })
  }))
}

function notFound (req, res, opts) {
  res.statusCode = 404
  res.end('404: Not Found')
}

function sendError (req, res, err) {
  console.error(err)
  res.statusCode = 500
  res.end('500: Internal Error')
}

function sendUnauthorized (req, res, email) {
  console.log('Unauthorized: %s', email)
  res.statusCode = 401
  res.end('401: Unauthorized')
}

function authify (route) {
  return function (req, res, opts) {
    auth(req, res, function (err, authData) {
      if (err) {
        if (err.name === 'TokenExpiredError') return sendUnauthorized(req, res)
        return sendError(req, res, err)
      }

      authData = authData || {}

      getAccessList(function (err, list) {
        if (err) return sendError(req, res, err)

        var hasAccess = list.indexOf(authData.email) >= 0
        if (!hasAccess && list.length) {
          return sendUnauthorized(req, res, authData.email)
        }

        route(req, res, opts)
      })
    })
  }
}

function getAccessList (cb) { accessCache.get('_access', cb) }

function empty (req, res) {
  res.writeHead(204)
  res.end()
}
