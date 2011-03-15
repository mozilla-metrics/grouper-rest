// Storage container interface: A dummy that always fails.
// Callbacks always take (err, success) where success is either boolean (for
// put), or the data that was fetched (for get).
var top = {
  putDocument: function(namespace, collectionKey, document, callback) { 
    callback("putDocument: store not implemented", false)
  }
, getCluster: function(namespace, collectionKey, label, callback) {
   function fallback (err, all) {
     if (err) callback(err, null)
     else callback(err, all[label])
   }
   return top.getAllClusters(namespace, collectionKey, fallback)
  }
, getAllClusters: function(namespace, collectionKey, callback) { 
    callback("getAllClusters: store not implemented", null)
  }
}

var config = require('../config')

var exports = module.exports = {
  top: function() { return top }
, set: function(container) { top = container; return exports }
, push: function(module) { return exports.set(module(config, top)) }
}
