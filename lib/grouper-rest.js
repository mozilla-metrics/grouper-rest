var connect = require('connect')
  , quip = require('quip')
var stackFactory = require('./store/stack')
  , query = require('./store/query')
  , queue = require('./queue/queue')
  , hbase = require('./store/hbase')
  , redis = require('./store/redis')
  , defaults = require('./store/defaults')


var UTF8 = 'utf-8'

exports.start = function (conf, cb) {

  var stack = stackFactory(conf).push(hbase).push(defaults)
  var store

  stack.on('error', function(err) {
    console.log('failed to initialize storage')
    if (cb) { cb(err) } else { throw err }
  })

  stack.build(function(err, api) {
    if (err) {
      if (cb) return cb(err)
      else throw err
    }
    store = api
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


  function report(req, res, err) {
    return res.json({error: err.toString()})
  }

  function postDoc (req, res) {
    function badReq() {
      return report(req, res.badRequest(), 'Cannot parse JSON request.')
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
      var q = query.forDocument(ns, key, doc.id)
      store.putDocument(query, doc, function (err, success) {
        if (err) report(req, res.error(), 'Failed to store document')
        else res.created().json(['/docs', ns, key, doc.id].join('/'))
      })
    })
  }

  function getDoc (req, res) {
    var ns = req.params.ns
      , key = req.params.collectionKey
      , id = req.params.docId
    var q = query.forDocument(ns, key, id)
    store.getDocument(q, function(err, doc) {
      console.log("query: ", q)
      if (err) report(req, res.notFound(), 'Could not find document')
      else res.ok().json(doc)
    })
  }

  function tbd (req, res) {
    console.log("unimplemented functionality accessed")
    res.error().json({error: "Not implemented yet"})
  }

}
