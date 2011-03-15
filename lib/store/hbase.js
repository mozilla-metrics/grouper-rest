var url = require('url')
  , hbase = require('hbase')
  , keys = require('./keys')

// Storage container using HBase
module.exports = function(config, next) {
  
  var client = hbase(url.parse(config.hbaseRest))
    , DOCS = config.tableName('documents')
    , COLLECTIONS = config.tableName('collections')
    , CLUSTERS = config.tableName('clusters')
    
  return {
      putDocument: function (ns, ck, doc, callback) { 
        // :TODO: Ideally we would update the collection size here, but REST
        // does not seem to expose atomic increment yet (-> verify this). 
        // So we will update it during vectorization for now.
        client.getRow(DOCS, keys.document(ns, ck, doc.id)).put(
            [ 'content:namespace'
            , 'content:collection'
            , 'content:id'
            , 'content:text'
            , 'membership:DEFAULT'
            ]
          , [ns, ck, doc.id, doc.text, '<QUEUED>']
          , callback 
        )
      }
    , getCluster: function (ns, ck, label, callback) { 
        // :TODO: implement
        return next.getCluster(ns. ck, label) 
      }
    , getAllClusters: function (ns, ck, callback) {
        // :TODO: implement
        return next.getAllClusters(ns. ck) 
      }
  }
}
