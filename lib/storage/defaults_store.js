var fail = require('assert').fail;

var model = require('../model');
var service = require('../service');
var Store = require('./store').Store;
var StoreFactory = require('./store').StoreFactory;
var NoopStore = require('./noop_store').NoopStore;


/**
 * Gets default values for incomplete references.
 *
 * @constructor
 * @implements {Store}
 */
function DefaultsStore(next, top) {

  NoopStore.call(this, next);

  var rebuilt = model.Collection.ATTRIBUTES.rebuilt;

  function withDefaults(nextStoreMethod, clusterRef, call) {
    var timestamp = clusterRef.timestamp();
    if (timestamp != null) return nextStoreMethod(clusterRef, call);

    var directCall = service.createDirectCall(function (err, collection) {
      if (err) return call.error(err);
      collection instanceof model.Collection ||
        call.error({status: 404, message: "Collection not found!"});

      timestamp = collection.get(rebuilt);
      var completeRef = new model.ClusterRef(collection.ref(),
                                             timestamp,
                                             clusterRef.label(),
                                             clusterRef.confName());
      nextStoreMethod(completeRef, call);
    });

    top().getCollection(clusterRef.ownerRef(), directCall);
  }


  this.getCluster = function getCluster_(clusterRef, call) {
    withDefaults(next.getCluster, clusterRef, call);
  };

  this.getAllClusters = function getAllClusters_(clusterRef, call) {
    withDefaults(next.getAllClusters, clusterRef, call);
  };

  this.toString = function toString_() {
    return '(DefaultsStore)';
  };
}

DefaultsStore.prototype = new NoopStore;


/**
 * @constructor
 * @implements {StoreFactory}
 */
function DefaultsStoreFactory() {
  this.create = function create(_, next, top, cb) {
    next instanceof Store || fail();
    top instanceof Function || fail();

    cb(null, new DefaultsStore(next, top));
  };
}

DefaultsStoreFactory.prototype = new StoreFactory;


module.exports = {
    factory: new DefaultsStoreFactory(),
    DefaultsStore: DefaultsStore
};
