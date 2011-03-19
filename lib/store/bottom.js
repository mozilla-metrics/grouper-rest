/**
 * Abstract storage container.
 * Callbacks always take (err, success). In the absence of err, success is
 * either true (for PUT), or the data that was fetched (for GET).
 */
var exports = module.exports = function(config, next, stack, cb) {
  cb(null, {

    /**
     * Fetch an individual document IDs for one cluster.
     *
     * @param q   Query with `ns`, `ck`, `confName`, `ts` and `label` set.
     * @param cb  A function expecting (err, cluster), where cluster is
     *            an array of strings.
     */
    getCluster: function (q, cb) {
      function fallback (err, all) {
        if (err) return cb(err, null)
        if (!(q.label in all)) return cb({code: 404})
        else cb(err, all[q.label])
      }
      stack.top().getAllClusters(q, fallback)
    }

    /**
     * Fetch all clusters of docs for the given clustering
     * @param q  Query with `ns`, `ck`, `confName` and `ts` set.
     * @param cb A function expecting (err, clusters), where clusters is
     *           a mapping from labels to cluster-lists (see getCluster)
     */
  , getAllClusters: function (q, cb) {
      callback("getAllClusters: store not implemented", null)
    }

    /**
     * Fetch a information about a given collection.
     * @param q   Query with `ns`, `ck` set.
     * @param cb  `(err, meta) ->`, where meta is at least:
     *            { size: <size>
     *            , configurations: {
     *                "DEFAULT": { "lastRebuild": <ts>
     *                           , "lastUpdate": <ts>
     *                           }
     *              }
     *            }
     */
  , getCollectionInfo: function (q, cb) {
      callback("getCollectionInfo: store not implemented", null)
    }

    /**
     * Add a document to a collection.
     * @param q   Query with `ns`, `ck`, `docId` set.
     */
  , putDocument: function (q, document, cb) {
      callback("putDocument: store not implemented", null)
    }

    /**
     * Fetch a document from a collection.
     * @param q   Query with `ns`, `ck`, `docId` set.
     */
  , getDocument: function (q, cb) {
      callback("getDocument: store not implemented", null)
    }
  })
}
