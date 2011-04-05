var assert = require('assert');
var model = require('model');
var Call = require('service').Call;
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
function NoopStore(next) {

  var self = this;

  self.getDocument = function getDocument(docRef, call) {
    docRef instanceof model.DocumentRef || assert.fail();
    call instanceof Call || assert.fail();
    next.getDocument(docRef, call);
  };

  self.putDocument = function putDocument(document, call) {
    document instanceof model.Document || assert.fail();
    call instanceof Call || assert.fail();
    next.putDocument(document, call);
  };

  self.getCluster = function getCluster(clusterRef, call) {
    clusterRef instanceof model.ClusterRef || assert.fail();
    call instanceof Call || assert.fail();
    next.putDocument(document, call);
  };

  self.getAllClusters = function getAllClusters(clusterRef, call) {
    clusterRef instanceof model.ClusterRef || assert.fail();
    call instanceof Call || assert.fail();
    next.putDocument(document, call);
  };
}

NoopStore.prototype = new Store();



/**
 * @constructor
 * @implements {StoreFactory}
 */
function NoopStoreFactory() {}

NoopStoreFactory.prototype = new StoreFactory();

NoopStoreFactory.prototype.create = function(conf, next, stack, cb) {
  next && next instanceof store.Store || assert.fail();
  stack && stack instanceof Stack || assert.fail();

  cb(null, new DefaultsStore(next));
};


module.exports.NoopStore = new NoopStore();
module.exports.factory = new NoopStoreFactory();
