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

  stack.build(function (err, api) {
    if (err) {
      console.log('Failed to initialize storage!')
      if (cb) return cb(err)
      else throw err
    }
    store = api
    var server = connect.createServer(
      connect.favicon()
    , quip()
    , connect.router(function(app) {
        app.post('/collections/:ns/:collectionKey', postDoc)
        app.get('/docs/:ns/:collectionKey/:docId', getDoc)
        app.get('/clusters/:ns/:collectionKey/:label', getCluster)
        app.get('/clusters/:ns/:collectionKey', getAllClusters)
        app.get('/*', function (req, res) {
          report(req, res.notFound(), "No such API")
        })
      })
    )
    if (cb) cb(null, server)
  })


  function report (req, res, err) {
    return res.json({error: err.toString()})
  }

  function postDoc (req, res) {
    function badReq() {
      return report(req, res.badRequest(), 'Cannot parse JSON request.')
    }
    var doc, data = []

    req.on('data', function (chunk) { data.push(chunk.toString(UTF8)) })
    req.on('end', function () {
      try { doc = JSON.parse(data.join('')) }
      catch(e) { return badReq() }
      q = query.forDocument(req.params.ns, req.params.collectionKey, doc.id)
      if (!("id" in doc) || !("text" in doc)) return badReq()
      store.putDocument(q, doc, function (err, success) {
        if (err) report(req, res.error(), 'Failed to store document')
        else res.created().json(['/docs', q.ns, q.ck, doc.id].join('/'))
      })
    })
  }

  function getDoc (req, res) {
    var q = query.forDocument( req.params.ns
                             , req.params.collectionKey
                             , req.params.docId)
    store.getDocument(q, function (err, doc) {
      if (err) report(req, res.notFound(), 'Could not find document')
      else res.ok().json(doc)
    })
  }

  function getCluster (req, res) {
    var q = query.forCluster( req.params.ns
                            , req.params.collectionKey
                            , req.params.label)
    store.getCluster(q, function (err, cluster) {
      if (err) report(req, res.notFound(), 'Could not find cluster')
      else res.ok().json(cluster)
    })
  }

  function getAllClusters (req, res) {
    var q = query.forAllClusters(req.params.ns, req.params.collectionKey)
    store.getAllClusters(q, function (err, clusters) {
      if (err) report(req, res.notFound(), 'Could not find clusters')
      else res.ok().json(clusters)
    })
  }

}
