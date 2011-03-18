// Storage container interface that fills sensible defaults where queries
// are not specific. Useful as the top of the storage middleware stack.
var exports = module.exports = function(config, next, stack, cb) {

  function withDefaults(f) {
    return function(q, callback) {
      if (!q.confName) q.confName = "DEFAULT"
      if (q.ts) {
        f(q, callback)
        return
      }
      stack.top().getCollectionInfo(q, function (err, info) {
        if (err) {
          callback(err, null)
          return
        }
        q.ts = info.configurations[q.confName].lastRebuild
        f(q, callback)
      })
    }
  }

  cb(null, {
    getCluster: withDefaults(next.getCluster)
  , getAllClusters: withDefaults(next.getAllClusters)
  , getCollectionInfo: function (q, callback) {
      next.getCollectionInfo(q, callback)
    }
  , putDocument: function (q, doc, callback) {
      next.putDocument(q, doc, callback)
    }
  , getDocument: function (q, callback) {
      next.getDocument(q, callback)
    }
  })
}
