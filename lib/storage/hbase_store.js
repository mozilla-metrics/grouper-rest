var fail = require('assert').fail;
var url = require('url');

var hbase = require('hbase');
var asyncMap = require('slide').asyncMap;
var jsonBuilder = require('json-builder');

var model = require('../model'),
    Document = model.Document,
    Collection = model.Collection;
               ;
var Call = require('../service').Call;

var Store = require('./store').Store;
var StoreFactory = require('./store').StoreFactory;
var NoopStore = require('./noop_store').NoopStore;


var MAX_VERSION = 2147483647;

var SCHEMA = {
  documents: {ColumnSchema: [
      {name: 'main'}, {name: 'processing'}
  ]},
  collections: {ColumnSchema: [
      {name: 'main'}, {name: 'processing'}
  ]},
  clusters: {ColumnSchema: [
      {name: 'main', VERSIONS: MAX_VERSION},
      {name: 'documents', VERSIONS: MAX_VERSION}
  ]}
};
var TABLE_NAMES = [];
for (var t in SCHEMA) TABLE_NAMES.push(t);


var CONF_PREFIX = "general:prefix";
var CONF_KEYS_SCHEME = "storage:hbase:keys:scheme";
var CONF_HBASE_REST = "storage:hbase:rest";


function tableName(conf, suffix) {
  var prefix = conf.get(CONF_PREFIX) || fail();
  return prefix + suffix;
}

function hbaseClient(conf) {
  var restUrl = conf.get(CONF_HBASE_REST) || fail();
  var parts = url.parse(restUrl);
  return hbase({'host': parts.hostname, 'port': parts.port});
}


/**
 * HBase backed store.
 *
 * @constructor
 * @implements {Store}
 */
function HBaseStore(conf, next, stack) {

  var keys = (function() {
    var keysScheme = conf.get(CONF_KEYS_SCHEME) || fail();
    switch (keysScheme) {
      case "SIMPLE": return require('./keys/simple_keys');
      case "REVERSE_PARTS": return require('./keys/reverse_parts_keys');
      default: fail();
    }
  })();

  var client = hbaseClient(conf);


  var DOCUMENTS = tableName(conf, 'documents');
  var COLLECTIONS = tableName(conf, 'collections');
  var CLUSTERS = tableName(conf, 'clusters');

  var LATEST = {v: 1};


  this.getDocument = function getDocument_(docRef, call) {
    function receive(err, cells) {
      if (err) return call.cb(err);
      var text = null;
      cells.forEach(function (cell) {
        if (cell.column == "main:text") text = cell.$;
      });
      if (text === null) return call.error("Missing text column");
      return call.cb(null, new Document(docRef, text));
    }

    client.getRow(DOCUMENTS,
                  keys.document(docRef)).get('main', LATEST, receive);
  };


  this.putDocument = function putDocument_(document, call) {
    var row = client.getRow(DOCUMENTS, keys.document(document.ref()));
    var collectionRef = document.ref().ownerRef();

    row.put(['main:namespace',
             'main:collection',
             'main:id',
             'main:text',
             'main:member_of:DEFAULT'],
            [collectionRef.namespace(),
             collectionRef.key(),
             document.ref().id(),
             document.text(),
             '<QUEUED>'],
             updateCollectionInfo);

    function updateCollectionInfo(err) {
      if (err) return respond(err);

      var row = client.getRow(COLLECTIONS, keys.collection(collectionRef));
      // TODO:
      // Ideally we would also update size here, but hbase REST does not seem
      // to expose atomic increment. So the worker needs to maintain it for now.
      // TODO: no need to update the ns+collection key everytime -- we just
      //       need to make sure the collection exists, which will be easy
      //       cheap with Redis.
      row.put(['main:namespace',
               'main:collection',
               'main:modified'],
              [collectionRef.namespace(),
               collectionRef.key(),
               ''+new Date().getTime()],
              respond);
    }

    function respond(err) {
      if (err) return call.error(err);
      // TODO: somewhat violating separations of concerns here :/
      var url = ['', 'docs', collectionRef.namespace(), collectionRef.key(),
                 document.ref().id()].join('/');
      call.write(url);
      call.cb(null, true);
    }

  };


  this.getCollection = function getCollection_(collectionRef, call) {
    function startsWith(str, prefix) {
      return str.substr(0, prefix.length) === prefix;
    }

    var attributes = {};
    var size = null;

    function receive(err, cells) {
      if (err) return call.cb(err);
      cells.forEach(function (cell) {
        switch (cell.column) {
          case 'main:size':
            attributes[Collection.ATTRIBUTES.size] = cell.$;
            return;
          case 'main:modified':
            attributes[Collection.ATTRIBUTES.modified] = cell.$;
            return;
          case 'main:configuration:DEFAULT:rebuilt':
            attributes[Collection.ATTRIBUTES.rebuilt] = cell.$;
            return;
        }
      });
      var result = new Collection(collectionRef, attributes);
      call.cb(null, result);
    }
    var table = client.getTable(COLLECTIONS);
    table.getRow(keys.collection(collectionRef)).get(LATEST, receive);
  };


  this.getCluster = function getCluster_(clusterRef, call) {
    function receive(err, cells) {
      if (err) return call.cb(err);
      var json = jsonBuilder.stream(call).list();
      cells.forEach(function (cell) {
        var column = cell.column.split(':');
        var family = column[0], qualifier = column[1];
        if (family == "documents") {
          json.val(qualifier);
        }
      });
      json.close();
      return call.cb(null, true);
    }
    var table = client.getTable(CLUSTERS);
    table.getRow(keys.cluster(clusterRef)).get(LATEST, receive);
  },


  this.getAllClusters = function getAllClusters_(clusterRef, call) {
    var prefix = keys.allClusters(clusterRef);
    var last = prefix.length - 1;
    var endKey = prefix.slice(0, last) +
                 String.fromCharCode(prefix.charCodeAt(last) + 1);

    scanClustersToStream_(client.getTable(CLUSTERS), prefix, endKey, call);
  };


  this.toString = function toString_() {
    return ['(HBaseStore in ', prefix, '*)'].join('');
  };


  function scanClustersToStream_(table, prefix, endKey, call) {

    var SCANNER_BATCH_SIZE = 1024*16;

    // TODO: Optimize scan by adding filter for the "documents:" column family.
    var scanProps = {
        startRow: prefix,
        endRow: endKey,
        batch: SCANNER_BATCH_SIZE
    };

    table.getScanner().create(scanProps, function scannerUp(err, scannerID) {
      if (err) return call.error(err);

      var json = jsonBuilder.stream(call).map();
      var previousLabel = null;
      function receiveMore(error, cells) {
        if (err) return call.error(err);
        var scanner = table.getScanner(scannerID);
        if (!cells) {
          scanner['delete'](); // Done. Free scanner.
          if (previousLabel != null) json.close(); // Closing last cluster.
          json.close(); // Closing the map of clusters.
          return call.cb(null, true);
        }
        cells.forEach(function (cell) {
          var columnID = cell.column.split(":", 2);
          var family = columnID[0], qualifier = columnID[1];
          if (family !== "documents") return;
          var label = cell.key.substring(prefix.length);
          if (label !== previousLabel) {
            if (previousLabel !== null) json.close();
            json.key(label);
            json.list();
            previousLabel = label;
          }
          json.val(qualifier);
        });
        scanner.get(receiveMore);
      }

      table.getScanner(scannerID).get(receiveMore);
    });
  }

}

HBaseStore.prototype = new Store;



/**
 * Helps managing Grouperfish tables in HBase.
 *
 * @constructor
 */
function HBaseAdmin(conf) {

  var self = this;
  var client = hbaseClient(conf);

  /**
   * Create Grouperfish tables in HBase if they do not already exist.
   *
   * @param cb  Called when tables are either available or a fatal error
   *            occurred trying to look them up or create them.
   */
  self.createAnyMissingTables = function createAnyMissingTables(cb) {
    // Make sure our hbase schema exists, then signal the callback.
    asyncMap(TABLE_NAMES, createTable, function whenTablesOk(err, tables) {
      if (err) return cb(err);
      return cb(null, true);
    });
  };


  /**
   * Recreate the HBase tables used by this Grouperfish installation.
   * All existing data is removed.
   *
   * @param {service.callback} standard callback, <tt>true</tt> for success.
   */
  self.reset = function reset(cb) {
    asyncMap(TABLE_NAMES, dropTable, function whenTablesDropped(err, success) {
      if (err) return cb(err);
      self.createAnyMissingTables(cb);
    });
  };


  function dropTable(name, cb) {
    console.log("Dropping table", tableName(conf, name));
    var table = client.getTable(tableName(conf, name));
    // workaround for sad editor that sees keyword in table.delete(...)
    table['delete'](function whenTableDropped(err, success) {
      if (err) return cb(err);
      return cb(null, success);
    });
  }


  function createTable(name, cb) {
    var safeName = tableName(conf, name);
    var table = client.getTable(safeName);
    var tableDef = SCHEMA[name];

    table.getSchema(function checkSchema(err, schema) {
      if (!err) return cb(null, safeName);
      table.create(tableDef, function whenTableCreated(err, success) {
        if (err) return cb(err, null);
        return cb(null, success);
      });
    });
  }

}


/**
 * @constructor
 * @implements {StoreFactory}
 */
function HBaseStoreFactory() {
  this.create = function create(conf, next, top, cb) {
    conf || fail();
    next instanceof Store || fail();
    top instanceof Function || fail();

    new HBaseAdmin(conf).createAnyMissingTables(function (err, ok) {
      if (err) return cb(err);
      return cb(null, new HBaseStore(conf, next, top));
    });
  };

  this.createAdmin = function createAdmin(conf) {
    return new HBaseAdmin(conf);
  };
}

HBaseStoreFactory.prototype = new StoreFactory();


module.exports = {
    HBaseStore: HBaseStore,
    HBaseAdmin: HBaseAdmin,
    factory: new HBaseStoreFactory()
};
