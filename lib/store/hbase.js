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



// Have row key generation in one place, so we can change it,
// e.g. to perform manual region splits more predictably by using hashes.
var keyFor = {
  doc: function (q) {
    return [q.ns, q.ck, q.id].join('/')
  }
, collection: function (q) {
    return [q.ns, q.ck].join('/')
  }
, cluster: function (q) {
    return [q.confName, q.ns, q.ck, q.ts, q.label].join('/')
  }
, allClusters: function (q) {
    return [q.confName, q.ns, q.ck, q.ts, '*'].join('/')
  }
}


// Storage container using HBase
var exports = module.exports = function(conf, next, stack, cb) {
  var client = conf.hbaseClient()
    , DOCS = conf.tableName('documents')
    , COLLECTIONS = conf.tableName('collections')
    , CLUSTERS = conf.tableName('clusters')

  function create (name, cb_) {
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
      cb(null, api)
    })
  }())

  var api = {
    toString: function () { return "store::hbase api" }
  , putDocument: function (q, doc, cb) {
      // :TODO: Ideally we would update the collection size here, but
      // hbase REST does not seem to expose atomic increment yet (-> verify)
      // So we will update it during vectorization for now.

      // :TODO: add support for document URLs
      var row = client.getRow(DOCS, keyFor.doc(q))
      row.put(
          [ 'content:namespace'
          , 'content:collection'
          , 'content:id'
          , 'content:text'
          , 'membership:DEFAULT'
          ]
        , [q.ns, q.ck, doc.id, doc.text, '<QUEUED>']
        , cb
      )
    }

  , getDocument: function (q, cb) {
      function cb_(err, cells) {
        if (err) return cb(err)
        var doc = {id: null, text: null}
        cells.forEach(function (cell) {
          if (cell.column == "content:id") doc.id = cell.$
          if (cell.column == "content:text") doc.text = cell.$
        })
        cb(null, doc)
      }
      client.getRow(DOCS, keyFor.doc(q)).get('content', {v:1}, cb_)
    }

  , getCluster: function (q, cb) {
      // :TODO: implement efficiently (without use of the generic fallback)
      next.getCluster(q, cb)
    }

  , getAllClusters: function (q, cb) {
      // :TODO:
      // Instead of glob-get, we should use a scanner and emit our response
      // in a streaming fashion.
      var globKey = keyFor.allClusters(q)
      var prefixLength = globKey.length - 1
      var cf = 'documents', cfLength = 'documents:'.length

      function cb_ (err, cells) {
        if (err) return cb(err)
        var clusters = {}
        cells.forEach(function (cell) {
          var label = cell.key.slice(prefixLength)
          if (!(label in clusters)) clusters[label] = []
          clusters[label].push(cell.column.slice(cfLength))
        })
        cb(null, clusters)
      }
      client.getRow(CLUSTERS, keyFor.allClusters(q)).get(cf, {v:1}, cb_)
    }

  , getCollectionInfo: function (q, cb) {
      var info = { configurations: {} }
      var prefixLength = "configurations:".length
      function cb_ (err, cells) {
        if (err) return cb(err)
        cells.forEach(function (cell) {
          if (cell.name == "meta:size") {
            info.size = cell.$
            return
          }
          if (cell.column.slice(0, prefixLength) == "configurations:") {
            var name = cell.column.slice(prefixLength)
            info.configurations[name] = JSON.parse(cell.$)
          }
        })
        cb(null, info)
      }
      client.getTable(COLLECTIONS).getRow(keyFor.collection(q)).get({v:1}, cb_)
    }
  }

}
