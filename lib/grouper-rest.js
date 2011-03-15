var connect = require('connect')
  , quip = require('quip')
  , config = require('./config')
  , query = require('./store/query')
  , queue = require('./queue/queue')

var UTF8 = 'utf-8'
  , CONFIG_FILE_NAME = process.argv[2]

config(CONFIG_FILE_NAME)
.on('error', function (reason) {
  console.log("Could not initialize configuration:", reason)
})
.on('configured', function (config) {

  var store = require('./store/stack')(config)
              .push(require('./store/hbase'))
              .push(require('./store/redis'))
              .push(require('./store/defaults'))
              .top()

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
        else res.created().json("/docs/" + ns + "/" + key + "/" + doc.id)
      })
    })
  }
  
  
  function tbd (req, res) { res.error().json({error: "Not implemented yet"}) }
  
  connect.createServer(
      connect.favicon()
    , quip()
    , connect.router(function(app) {
        app.post('/collections/:ns/:collectionKey', postDoc)
        app.get('/clusters/:ns/:collectionKey/:label', tbd)
        app.get('/clusters/:ns/:collectionKey', tbd)
        app.get('/docs/:ns/:collectionKey/:docId', tbd)
      })
  ).listen(config.restPort)
  
  console.log("OK. Listening on port", config.restPort)
  
})
