// Storage container interface that fills sensible defaults where queries
// are not specific. Useful as the top of the storage middleware stack.
var exports = module.exports = function(config, next, stack, cb) {
  function withDefaults(f) {
    return function(query, callback) {
      if (!query.confName) query.confName = "DEFAULT"
      if (query.ts) {
        f(query, callback)
        return
      }
      stack.top().getCollectionMeta(query, function (err, meta) {
        if (err) {
          callback(err, null)
          return
        }
        query.timestamp = meta.configurations[query.confName].lastRebuild
        f(query, callback)
      })
    }
  }

  cb(null, {
    getCluster: withDefaults(next.getCluster)
  , getAllClusters: withDefaults(next.getAllClusters)
  , getConfiguration: function (query, callback) {
      next.getConfiguration(query, callback)
    }
  , putDocument: function (query, doc, callback) {
      next.putDocument(query, doc, callback)
    }
  })
}
