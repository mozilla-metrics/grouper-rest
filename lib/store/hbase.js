var url = require('url')
  , hbase = require('hbase')
  , asyncMap = require('slide').asyncMap

var flow = require('flow')


var MAX_VERSION = 2147483647
var SCHEMA = {
  'documents': {
    ColumnSchema: [
      {name: 'content'}
    , {name: 'mahout'}
    , {name: 'membership', VERSIONS: MAX_VERSION}
    ]
  }
, 'collections': {
    ColumnSchema: [
      {name: 'meta'}
    , {name: 'mahout'}
    , {name: 'configurations'}
    ]
  }
, 'clusters': {
    ColumnSchema: [
      {name: 'meta', VERSIONS: MAX_VERSION}
    , {name: 'mahout', VERSIONS: MAX_VERSION}
    , {name: 'documents', VERSIONS: MAX_VERSION}
    ]
  }
}



// Have row key generation in one place, so we can change it, e.g.
// to use MD5 keys for easier region sharding.
var keyFor = {
  doc: function (query) {
    return [query.ns, query.ck, query.id].join('/')
  }
, collection: function (query) {
    return [query.ns, query.ck].join('/')
  }
, cluster: function (query) {
    return [ query.confName, query.ns, query.ck, query.ts
           , query.label].join('/')
  }
, allClusters: function (query) {
    return [query.confName, query.ns, query.ck, query.ts].join('/')
  }
}


// Storage container using HBase
var exports = module.exports = function(conf, next, stack, cb) {
  var client = conf.hbaseClient()
    , DOCS = conf.tableName('documents')
    , COLLECTIONS = conf.tableName('collections')
    , CLUSTERS = conf.tableName('clusters')

  function create(name, cb_) {
    var safeName = conf.tableName(name)
      , tableDef = SCHEMA[name]
      , table = client.getTable(safeName)
    table.getSchema(function(err, schema) {
        if (err) return table.create(tableDef, function (err, success) {
          if (err) return cb_(err, null)
          cb_(null, success)
        })
        cb_(null, safeName)
    })
  }

  // Make sure our hbase schema exists.
  ;(function () {
    var names = []
    for (var t in SCHEMA) names.push(t)
    asyncMap(names, create, function(err, tables) {
      if (err) return cb(err, null)
      console.log('Tables available: ', tables.join(', '))
      cb(null, api)
    })
  }())

  var api = {
    putDocument: function (query, doc, callback) {
      // :TODO: Ideally we would update the collection size here, but
      // hbase REST does not seem to expose atomic increment yet (-> verify)
      // So we will update it during vectorization for now.

      // :TODO: add support for document URLs
      client.getRow(DOCS, keyFor.document(query)).put(
          [ 'content:namespace'
          , 'content:collection'
          , 'content:id'
          , 'content:text'
          , 'membership:DEFAULT'
          ]
        , [query.ns, query.ck, doc.id, doc.text, '<QUEUED>']
        , callback
      )
    }
  , getCluster: function (query, callback) {
      // :TODO: implement efficiently (without use of generic fallback)
      next.getCluster(query, callback)
    }
  , getAllClusters: function (query, callback) {
      // :TODO: We actually only want to fetch the column family
      // 'documents:*' which is not supported by node-hbase (yet).
      // We should either extend node-hbase or add a filter.
      hbase.getTable(CLUSTERS).getScanner({
        filter: {
          type: 'WhileMatchFilter'
        , filter: {
            type: 'RowFilter'
          , op: 'EQUAL'
          , comparator: {
              value: keyFor.clusters(query)
            , type: 'BinaryPrefixComparator'
            }
          }
        }
      }).get(function (err, cells) {
        // :TODO: rewrap the scanner response
        // [{key: "conf/ns/ck/ts/label", column: "documents:id", ...}, ...]
        // as {"label":[id, ...], ...}
        console.log("Got cells: ")
        console.log(cells)
      })
    }
  , getConfiguration: function (query, callback) {
      var row = hbase.getTable(COLLECTIONS).getRow(keyFor.collection(query))
      var configuration = {}
      row.get('')
    }
  }
}
