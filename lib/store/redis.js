// Storage container using Redis
module.exports = function(config, next) {
  
  var url = require('url').parse(config.redis)
  var client = require('redis').createClient(url.port, url.host)
  
  return {
    putDocument: function (ns, ck, doc, callback) { 
      return next.putDocument(doc) 
    }
  , getCluster: function (ns, ck, label, callback) { 
      // TODO: cache transparently
      return next.getCluster(ns. ck, label) 
    }
  , getAllClusters: function (ns, ck, callback) {
      // TODO: cache transparently
      return next.getAllClusters(ns. ck) 
    }
  }
}
