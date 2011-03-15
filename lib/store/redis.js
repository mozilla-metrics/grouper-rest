/** Storage container using Redis (for caching). */
var exports = module.exports = function(config, next, stack) {
  
  var url = require('url').parse(config.redis)
  var client = require('redis').createClient(url.port, url.host)
  
  return {
    getCluster: function (query, callback) {
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
  }
}
