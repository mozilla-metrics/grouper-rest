var fail = require('assert').fail;

var service = require('service');
var model = require('model');
var stack = require('./stack');


/**
 * A storage stack layer.
 *
 * @interface
 */
function Store() {}

/**
 * @param {model.DocumentRef}  Document to fetch.
 * @param {service.Call} call  The service call context. Response: the corres-
 *                             ponding ({@link model.Document}) object.
 */
Store.prototype.getDocument = function getDocument_(docRef, call) {
  fail();
};

/**
 * @param {model.Document} document  Document to store.
 * @param {service.Call} call  The service call context. Response: A URL to
 *                             fetch this document again ({string}).
 */
Store.prototype.putDocument = function putDocument_(document, call) {
  fail();
};

/**
 * @param {model.ClusterRef} clusterRef  Cluster to get.
 * @param {service.Call} call  The service call context. Response:
 *                             {Array.<string>} (the matching document IDs).
 */
Store.prototype.getCluster = function getCluster_(clusterRef, call) {
  fail();
};

/**
 * Get information on a collection. This does not fetch the documents within
 * the collection.
 *
 * @param {model.CollectionRef} collectionRef  The collection to get.
 * @param {service.Call} call  The service call context. Response:
 *                             The corresponding ({model.Collection}) object.
 */
Store.prototype.getCollection = function getCollection_(collectionRef, call) {
  fail();
};

/**
 * @param {model.ClusterRef} clusterRef  Matches the clusters to get (label
 *                                       need not be set).
 * @param {service.Call} call  The service call context. Response:
 *                             {Object.{string, {Array.<string>}}
 *                             (the matching clusters IDs for each label).
 */
Store.prototype.getAllClusters = function getAllClusters_(clusterRef, call) {
  fail();
};


/**
 * Each store implementation exposes a factory that can be constructed
 * synchronously and without parameters.
 *
 * @interface
 */
function StoreFactory() {}

/**
 * Allows to create a store stack by cascading stores on top of other stores.
 * A store can decide for each service call if it is to be handled, or to be
 * cascaded.
 *
 * @param {!Object} next  The next lower store layer.
 * @param {!Store} next  The next lower store layer.
 * @param {!function(): Store} top  Once the stack is fully initialized, this
 *                                  can be used to access the top.
 * @param {!service.callback} cb  Store initialization is async. The callback
 *                                will be called with the initialized store as
 *                                the success argument.
 */
StoreFactory.prototype.create = function create_(conf, next, stack, cb) {
  fail();
};


exports.Store = Store;
exports.StoreFactory = StoreFactory;
