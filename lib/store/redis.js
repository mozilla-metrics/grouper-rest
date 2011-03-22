/** Storage container using Redis (for caching). */
var exports = module.exports = function(config, next, stack, cb) {

  var url = require('url').parse(config.redis)

  // var client = require('redis').createClient(url.port, url.host)

  // :TODO: transparent caching of the right things rather than noops...
  // this call will then be async, triggered by redis connect
  cb(null, {
    toString: function () { return "store::hbase api" }
  , getCluster: function (q, cb) {
      next.getCluster(q, cb)
    }
  , getAllClusters: function (q, cb) {
      next.getAllClusters(q, cb)
    }
  , getCollectionInfo: function (q, cb) {
      next.getCollectionInfo(q, cb)
    }
  , putDocument: function (query, document, callback) {
      next.putDocument(query, document, callback)
    }
  , getDocument: function (q, cb) {
      next.getDocument(q, cb)
    }
  })
}
