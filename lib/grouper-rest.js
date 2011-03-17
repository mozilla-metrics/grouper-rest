var connect = require('connect')
  , quip = require('quip')
var query = require('./store/query')
  , queue = require('./queue/queue')
  , hbase = require('./store/hbase')
  , redis = require('./store/redis')
  , defaults = require('./store/defaults')


var UTF8 = 'utf-8'

exports.server = function (conf, cb) {

  var stack = require('./store/stack')(conf, hbase, defaults)

  stack.on('error', function(up) {
    console.log('failed to initialize storage')
    if (cb) return cb(err)
    throw err
  })

  stack.on('available', function(store) {
    var server = connect.createServer(
        connect.favicon()
      , quip()
      , connect.router(function(app) {
          app.post('/collections/:ns/:collectionKey', postDoc)
          app.get('/clusters/:ns/:collectionKey/:label', tbd)
          app.get('/clusters/:ns/:collectionKey', tbd)
          app.get('/docs/:ns/:collectionKey/:docId', getDoc)
        })
    )
    if (cb) cb(null, server)
  })

  function postDoc (req, res) {
    function badReq() {
      return res.badRequest().json({error: 'Cannot parse JSON request.'})
    }
    var data = []
      , ns = req.params.ns
      , key = req.params.collectionKey
    req.on('data', function (chunk) { data.push(chunk.toString(UTF8)) })
    req.on('end', function () {
      var doc
      try { doc = JSON.parse(data.join('')) }
      catch(e) { return badReq() }
      if (!(id in doc) || !(text in doc)) return badReq()
      var query = query.forDocument(ns, key, doc.id)
      store.putDocument(query, doc, function (err, success) {
        if (err) res.error(err)
        else res.created().json(['/docs', ns, key, doc.id].join('/'))
      })
    })
  }

  function getDoc (req, res) {
    var ns = req.params.ns
      , key = req.params.collectionKey
  }

  function tbd (req, res) {
    console.log("unimplemented functionality accessed")
    res.error().json({error: "Not implemented yet"})
  }

}
