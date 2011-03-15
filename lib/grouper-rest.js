var connect = require('connect')
  , quip = require('quip')
  , config = require('./config')

var store = require('./store/hierarchy.js')
            .push(require('./store/hbase'))
            .push(require('./store/redis'))
            .top()
  , UTF8 = 'utf-8'

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
    store.putDocument(doc)
  })
}


function tbd (req, res) { res.error().json({error: "Not implemented yet"}) }

exports.server = connect.createServer(
    connect.favicon()
  , quip()
  , connect.router(function(app) {
      app.post('/collections/:ns/:collectionKey', postDoc)
      app.get('/clusters/:ns/:collectionKey/:label', tbd)
      app.get('/clusters/:ns/:collectionKey', tbd)
      app.get('/docs/:ns/:docId', tbd)
    })
)
