/**
 * Abstract storage container.
 * Callbacks always take (err, success). In the absence of err, success is
 * either true (for PUT), or the data that was fetched (for GET).
 */
var exports = module.exports = function(config, next, stack, cb) {
  cb(null, {
    /**
     * Fetch an individual cluster of documents (or rather: of their IDs).
     *
     * @param callback  A function expecting (err, cluster), where cluster is
     *                  an array of strings.
     */
    getCluster: function (query, callback) {
      function fallback (err, all) {
        if (err) callback(err, null)
        else callback(err, all[label])
      }
      stack.top().getAllClusters(query, fallback)
    }

    /**
     * Fetch all clusters of docs for the given clustering (ns,ck,confName,ts)
     * ...
     * @param callback A function expecting (err, clusters), where clusters is
     *                 a mapping from labels to cluster-lists (see getCluster)
     */
  , getAllClusters: function (query, callback) {
      callback("getAllClusters: store not implemented", null)
    }

    /**
     * Fetch a information about a given collection (ns,ck)
     * ...
     * @param callback Function expecting (err, meta), where meta is at least:
     *                 {size: <size>
     *                 , configurations: {
     *                     "DEFAULT": { "lastRebuild": <ts> }
     *                   }
     *                 }
     */
  , getCollectionMeta: function (query, callback) {
      callback("getConfiguration: store not implemented", null)
    }

  , putDocument: function (query, document, callback) {
      callback("putDocument: store not implemented", null)
    }

  , getDocument: function (query, callback) {
      callback("getDocument: store not implemented", null)
    }
  })
}
