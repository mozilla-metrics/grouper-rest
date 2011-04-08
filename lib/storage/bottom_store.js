var fail = require('assert').fail;

var Stack = require('./stack').Stack;
var Store = require('./store').Store;
var StoreFactory = require('./store').StoreFactory;


/**
 * Bottom of the stack. Emulates some unhandled methods by using more basic
 * methods from the stack top.
 * If a call lands here that cannot be expressed more basically, this fails.
 *
 * @constructor
 * @implements {Store}
 */
function BottomStore(stack) {

  this.getDocument = function getDocument_(docRef, call) { fail(); };

  this.putDocument = function putDocument_(document, call) { fail(); };

  this.getCluster = function getCluster_(clusterRef, call) { fail(); };

  this.getCollection = function getCollection_(collectionRef, call) { fail(); };

  this.getAllClusters = function getAllClusters_(clusterRef, call) { fail(); };
}

BottomStore.prototype = new Store();


/**
 * @constructor
 * @implements {StoreFactory}
 */
function BottomStoreFactory() {
  this.create = function(_, _, top, cb) {
    top instanceof Function || fail();
    cb(null, new BottomStore(top));
  };
}

BottomStoreFactory.prototype = new StoreFactory;


module.exports = {
    BottomStore: BottomStore,
    factory: new BottomStoreFactory()
};
