var fail = require('assert').fail;

var model = require('../model');
var Call = require('../service').Call;
var Store = require('./store').Store;
var StoreFactory = require('./store').StoreFactory;


/**
 * A basic implementation that delegates everything to the next lower storage
 * level, usable as base class for your store. Also type-checks the arguments,
 * so you can put it right use it as an additional top-level.
 *
 * @constructor
 * @implements {Store}
 */
function NoopStore(next) {

  this.getDocument = function getDocument_(docRef, call) {
    docRef instanceof model.DocumentRef || fail();
    call instanceof Call || fail();
    next.getDocument(docRef, call);
  };

  this.putDocument = function putDocument_(document, call) {
    document instanceof model.Document || fail();
    call instanceof Call || fail();
    next.putDocument(document, call);
  };

  this.getCollection = function getCollection_(collectionRef, call) {
    collectionRef instanceof model.CollectionRef || fail();
    call instanceof Call || fail();
    next.getCollection(collectionRef, call);
  };

  this.getCluster = function getCluster_(clusterRef, call) {
    clusterRef instanceof model.ClusterRef || fail();
    call instanceof Call || fail();
    next.putDocument(document, call);
  };

  this.getAllClusters = function getAllClusters_(clusterRef, call) {
    clusterRef instanceof model.ClusterRef || fail();
    call instanceof Call || fail();
    next.putDocument(document, call);
  };
}

NoopStore.prototype = new Store;



/**
 * @constructor
 * @implements {StoreFactory}
 */
function NoopStoreFactory() {
  this.create = function create(_, next, _, cb) {
    next instanceof Store || fail();
    cb(null, new NoopStore(next));
  };
}

NoopStoreFactory.prototype = new StoreFactory;


module.exports = {
  NoopStore: NoopStore,
  factory: new NoopStoreFactory()
};
