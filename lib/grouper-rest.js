var connect = require('connect'),
    async = require('async');

var service = require('./service'),
    serviceCall = service.createHttpCall;

var model = require('./model'),
    Document = model.Document,
    DocumentRef = model.DocumentRef,
    CollectionRef = model.CollectionRef,
    ClusterRef = model.ClusterRef;

var StackFactory = require('./storage').StackFactory,
    hbase = require('./storage').hbase,
    defaults = require('./storage').defaults;


exports.start = function start(conf, cb) {

  var stackFactory = new StackFactory(conf);
  stackFactory.push(hbase.factory);
  stackFactory.push(defaults.factory);

  var store;
  stackFactory.build(function restStoreAvailable(err, top) {
    top instanceof defaults.DefaultsStore || fail();
    if (err) {
      console.log('Failed to initialize storage!');
      if (cb) return cb(err);
      throw err;
    }
    store = top;
    var server = connect.createServer(
      connect.favicon(),
      connect.logger(),
      connect.static(__dirname + "/../static"),
      connect.router(function (app) {
        app.post('/collections/:ns/:collectionKey', postDocument);
        app.get('/docs/:ns/:collectionKey/:docId', getDocument);
        app.get('/clusters/:ns/:collectionKey/:label', getCluster);
        app.get('/clusters/:ns/:collectionKey', getAllClusters);
        app.get('/*', function getDefault(req, res) {
          console.log("ERR: Request failed with 404, url: ", req.url);
          serviceCall(res).error({status: 404, message: "No Such API"});
        });
      })
    );
    if (cb) cb(null, server);
  });


  function insertDocument_(body, ns, ck, call) {
    if (!("id" in body)) {
      return call.error({status: 400, message: "Missing attribute 'id'."});
    }
    if (!("text" in body)) {
      return call.error({status: 400, message: "Missing attribute 'text'."});
    }

    // allow for numeric ID
    body.id = ""+body.id;
    var document = new Document(
        new DocumentRef(new CollectionRef(ns, ck), body.id),
        body.text
    );
    store.putDocument(document, call);

  }


  function postDocument(req, res) {
    var buffer = [];

    var call = serviceCall(res, null, 201);

    req.on('data', function (chunk) { buffer.push(chunk.toString('utf-8')); });
    req.on('end', function () {
      var body;
      try {
        body = JSON.parse(buffer.join(''));
      }
      catch(e) {
        return call.error({status: 400, message: "JSON parse error."});
      }

      var ns = req.params.ns, ck = req.params.collectionKey
      if ("bulk" in body) {
        postBulk(req, body.bulk, ns, ck, call);
        return;
      }

      insertDocument_(body, ns, ck, call);
    });
  }


  function postBulk(req, bulk, ns, ck, call) {

    var CONCURRENCY = 20;
    var inserts = 0;
    var failures = [];

    var q = async.queue(function doInsert_(body, cb) {
      insertDocument_(body, ns, ck, service.createDirectCall(function cb_(err, result) {
        ++inserts;
        cb(null);
      }));
    }, CONCURRENCY);

    q.empty = function bulkDone_() {
      call.cb(null, {numInserts: inserts, failures: failures});
    };

    function reporter(number) {
      return function (err) {
        if (err) {
          console.log("Item " + number + " -- There was an error: " + err);
          failures.push(bulk[i]);
          return;
        }
      }
    }

    for (var i = 0; i < bulk.length; ++i) {
      q.push(bulk[i], reporter(i));
    }

  }


  function getDocument(req, res) {
    var params = req.params;
    var docRef =
      new DocumentRef(new CollectionRef(params.ns, params.collectionKey),
                      params.docId);
    store.getDocument(docRef, serviceCall(res));
  }


  function getCluster(req, res) {
    var params = req.params;
    var clusterRef =
      new ClusterRef(new CollectionRef(params.ns, params.collectionKey),
                     null,
                     params.label);
    store.getCluster(clusterRef, serviceCall(res));
  }


  function getAllClusters(req, res) {
    var params = req.params;
    var clusterRef =
      new ClusterRef(new CollectionRef(params.ns, params.collectionKey),
                     null,
                     null);
    store.getAllClusters(clusterRef, serviceCall(res));
  }

};
