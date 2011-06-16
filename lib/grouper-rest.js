var connect = require('connect');

var serviceCall = require('./service').createHttpCall;

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
      if (!("id" in body)) {
        return call.error({status: 400, message: "Missing attribute 'id'."});
      }
      if (!("text" in body)) {
        return call.error({status: 400, message: "Missing attribute 'text'."});
      }

      // allow for numeric ID
      body.id = ""+body.id;
      var document = new Document(
          new DocumentRef(new CollectionRef(req.params.ns,
                                            req.params.collectionKey),
                          body.id),
          body.text
      );
      store.putDocument(document, call);
    });
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


  function getAllClusters (req, res) {
    var params = req.params;
    var clusterRef =
      new ClusterRef(new CollectionRef(params.ns, params.collectionKey),
                     null,
                     null);
    store.getAllClusters(clusterRef, serviceCall(res));
  }

};
