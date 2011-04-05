var url = require('url');
var hbase = require('hbase')
var asyncMap = require('slide').asyncMap;
var jsonBuilder = require('json-builder');

var flow = require('flow');


var MAX_VERSION = 2147483647;

/**
 * Depending on size and number of documents, you might want to
 * do something like this (sets maximum store file size to 64MB):
 * hbase> disable '[PREFIX]_documents'
 * hbase> alter '[PREFIX]_documents', METHOD => 'table_att', \
 *  ... >                                MAX_FILESIZE => '67108864'
 * hbase> enable '[PREFIX]_documents'
 */
var SCHEMA = {

  // row key: f(namespace, collection-key)/f(object-id)
  'documents': {
    ColumnSchema: [
      // content: basically everything that is not just used by mahout
      //   'namespace'  the namespace (same that is used for the row key)
      //   'collection' the collection key (see namespace)
      //   'text'       the text content of the document
      //   'id'         the original ID of the doc, provided the client
      //   'url'        (optional) permalink to the original resource
      {name: 'content'}

      // mahout support data on clustering
      //   'vector'     a sparse vector representation of the document text
      //   'id'         content:id (redundant), to input to the clusterer
    , {name: 'mahout'}

      // membership:
      //   '<configuration-name>': '<cluster-id>'
      //                Allows to track a document through clusterings.
      //                The timestamp should be the time a doc was added
      //                to the cluster. Multiple configurations can be
      //                "valid" for the same document. Each can have
      //                multiple versions.
      //                To start with, there is one configuration:
      //                "DEFAULT" with the special value "QUEUED"
      //                This also allows us to check if messages were
      //                dropped from the queue.
    , {name: 'membership', VERSIONS: MAX_VERSION}
    ]
  }

  // row key: f(namespace, collection-key)
, 'collections': {
    ColumnSchema: [
      // 'meta':
      //   'namespace'  the namespace (same as used for the row key)
      //   'key'        the collection-key (same as used for the row key)
      //   'size'       number of documents
      //   'modified'   time of last document added (timestamp)
      {name: 'meta'}

      // 'mahout':
      //   'dictionary  term->vector mappings, used to vectorize new documents
    , {name: 'mahout'}

      // configurations:       (at the start "DEFAULT" is the only <name>)
      //    '<name>:rebuilt'   timestamp of last full rebuild
      //    '<name>:processed' timestamp of last incremental update
      //    '<name>:...'       other (configuration specific) stuff
    , {name: 'configurations'}
    ]
  }

  // row key: f(configuration-name, ns, collection-key, rebuild-ts)/cluster-id
  // - in the beginning, configuration-name will always be "DEFAULT"
  // - later on it will help with sharding (multiple configurations of the same
  //   collection will be rebuilt at about the same time)
  // - the timestamp <ts> refers to the full rebuild. Clusters of a previous
  //   builds could actually be updated (for performance) while a complete
  //   reclustering is being computed (for quality). When a rebuild is
  //   complete, the 'current' timestamp of the configuration is updated.
, 'clusters': {
    ColumnSchema: [


      {name: 'meta', VERSIONS: MAX_VERSION}
      //     'center': a sparse vector for the center, e.g. used by k-means
    , {name: 'mahout', VERSIONS: MAX_VERSION}

      // documents:
      //  '<original-id>': '<distance-to-centroid>'
      //  , ... (lots of these. buildup can be 'replayed' looking at the ts)
    , {name: 'documents', VERSIONS: MAX_VERSION}
    ]
  }
};


var TABLE_NAMES = [];
for (var t in SCHEMA) TABLE_NAMES.push(t);


// Storage container using HBase
// The hbase-specific .reset works next and stack being undefined.
var exports = module.exports = function(conf, next, stack, cb) {

  var keyFor = conf.keys()

  var client = conf.hbaseClient();
  var DOCS = conf.tableName('documents');
  var COLLECTIONS = conf.tableName('collections');
  var CLUSTERS = conf.tableName('clusters');

  function drop (name, cb) {
    console.log("dropping", name)
    client.getTable(conf.tableName(name)).delete(function (err, success) {
      if (err) return cb(err)
      cb(null, success)
    });
  }

  function create (name, cb) {
    var safeName = conf.tableName(name);
    var tableDef = SCHEMA[name];
    var table = client.getTable(safeName);

    table.getSchema(function(err, schema) {
      if (!err) {
        return cb(null, safeName);
      }
      return table.create(tableDef, function (err, success) {
        if (err) return cb(err, null)
        cb(null, success)
      });
    });
  }

  function putDocument(q, doc, cb) {
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
    );
  }

  function getDocument (q, cb) {
    function cb_(err, cells) {
      if (err) return cb(err);
      var doc = {id: null, text: null};
      cells.forEach(function (cell) {
        if (cell.column == "content:id") doc.id = cell.$;
        if (cell.column == "content:text") doc.text = cell.$;
      });
      cb(null, doc);
    }
    client.getRow(DOCS, keyFor.doc(q)).get('content', {v:1}, cb_);
  }

  function getCluster (q, cb) {
    // :TODO: implement efficiently (without use of the generic fallback)
    next.getCluster(q, cb);
  }

  function streamAllClusters (q, stream, cb) {
    var globKey = keyFor.allClusters(q)
    var prefixLength = globKey.length - 1
    var cf = 'documents'
      , cfLength = 'documents:'.length

    var cb_;
    if (stream) {
      cb_ = function streamAllClusters (err, cells) {
        if (err) return cb(err)
        stream.writeHead(200, {'Content-Type': 'application/json'});

        var out = jsonBuilder.stream(stream).map()
          , prevLabel = null
        cells.forEach(function (cell) {
          var label = cell.key.slice(prefixLength)
          if (label != prevLabel) {
            if (prevLabel != null) stream.close()
            stream.key(label)
            stream.list()
          }
          stream.val(cell.column.slice(cfLength))
        })
        if (prevLavel != null) stream.close()
        stream.close()
        cb(null, null)
      }
    }
    else {
      cb_ = function bufferAllClusters (err, cells) {
        if (err) return cb(err);
        var clusters = {};
        cells.forEach(function (cell) {
          var label = cell.key.slice(prefixLength);
          if (!(label in clusters)) clusters[label] = [];
          clusters[label].push(cell.column.slice(cfLength));
        })
        cb(null, clusters);
      }
    }

    client.getRow(CLUSTERS, keyFor.allClusters(q)).get(cf, {v:1}, cb_);
  }

  function getCollectionInfo (q, cb) {
    var info = { configurations: {} }
    var prefixLength = "configurations:".length
    function cb_ (err, cells) {
      if (err) return cb(err)
      cells.forEach(function (cell) {
        if (cell.column == "meta:size") {
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
    var table = client.getTable(COLLECTIONS)
    table.getRow(keyFor.collection(q)).get({v:1}, cb_)
  }

  var api = {
    toString: function () { return "store::hbase api" }
  , putDocument: putDocument
  , getDocument: getDocument
  , getCluster: getCluster
  , getAllClusters: getAllClusters
  , getCollectionInfo: getCollectionInfo
  }

  api.reset = function (cb) {
    asyncMap(TABLE_NAMES, drop, function(err, success) {
      if (err) return cb(err);
      api.init(cb);
    });
  };

  api.init = function (cb) {
    // Make sure our hbase schema exists, then signal the callback.
    asyncMap(TABLE_NAMES, create, function(err, tables) {
      if (err) return cb(err);
      cb(null, api);
    });
  };

  api.init(cb);

}
