var assert = require('assert');
var model = require('model');
var Call = require('service').Call;
var NoopStore = require('noop_store').NoopStore;
var Store = require('store').Store;
var StoreFactory = require('store').StoreFactory;


/**
 * A basic implementation that delegates everything to the next lower storage
 * level, usable as base class for your store. Also type-checks the arguments,
 * so you can put it right use it as an additional top-level.
 *
 * @constructor
 * @implements {Store}
 */
function DefaultsStore(next) {

  var self = this;

  function withDefaults(nextStoreMethod, clusterRef, call) {
    var timestamp = clusterRef.timestamp();
    if (timestamp != null) {
      return nextStoreMethod(clusterRef, call);
    }

    var ownerRef = clusterRef.ownerRef();
    var label = clusterRef.label();
    var confName = clusterRef.confName();


      explicitRef = new model.ClusterRef();
    stack.top().getCollectionInfo(q, function (err, info) {
        if (err) {
          callback(err, null)
          return
        }
        q.ts = ""+info.configurations[q.confName].lastRebuild
        fun(q, stream, callback)
      })
  }

  self.getCluster = function getCluster(clusterRef, call) {
    withDefaults(next.getCluster, clusterRef, call);
  };

  self.getAllClusters = function getAllClusters(clusterRef, call) {
    withDefaults(next.getAllClusters, clusterRef, call);
  };
}

DefaultsStore.prototype = new NoopStore();



/**
 * @constructor
 * @implements {StoreFactory}
 */
function DefaultsStoreFactory() {}

DefaultsStoreFactory.prototype = new StoreFactory();

DefaultsStoreFactory.prototype.create = function(conf, next, stack, cb) {
  conf || assert.fail();
  next && next instanceof store.Store || assert.fail();
  stack && stack instanceof Stack || assert.fail();

  cb(null, new DefaultsStore(next));
};


module.exports.factory = new DefaultsStoreFactory();
