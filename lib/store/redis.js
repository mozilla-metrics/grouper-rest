/** Storage container using Redis (for caching). */
var exports = module.exports = function(config, next, stack, cb) {

  var url = require('url').parse(config.redis)
  // var client = require('redis').createClient(url.port, url.host)

  // this needs to be async, and will actually be triggered by redis
  // connect
  cb(null, {
    toString: function () { return "store::hbase api" }
  , getCluster: function (query, callback) {
      // :TODO: transparent caching
      next.getCluster(query, callback)
    }
  , getAllClusters: function (query, callback) {
      // :TODO: transparent caching
      next.getAllClusters(query, callback)
    }
  , getCollectionMeta: function (query, callback) {
      // :TODO: transparent caching
      next.getCollectionMeta(query, callback)
    }
  , putDocument: function (query, document, callback) {
      // :TODO: transparent caching
      next.putDocument(query, document, callback)
    }
  , getDocument: function (query, callback) {
      // :TODO: transparent caching
      next.getDocument(query, callback)
    }
  })
}
