var service = require('service');
var model = require('model');
var assert = require('assert');

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
Store.prototype.getDocument = function getDocument(docRef, call) {
  assert.fail();
};

/**
 * @param {model.Document} document  Document to store.
 * @param {service.Call} call  The service call context. Response: A URL to
 *                             fetch this document again ({string}).
 */
Store.prototype.putDocument = function putDocument(document, call) {
  assert.fail();
};

/**
 * @param {model.ClusterRef} clusterRef  Cluster to get.
 * @param {service.Call} call  The service call context. Response:
 *                             {Array.<string>} (the matching document IDs).
 */
Store.prototype.getCluster = function getCluster(clusterRef, call) {
  assert.fail();
};

/**
 * @param {model.CollectionRef} collectionRef  The collection to get.
 * @param {service.Call} call  The service call context. Response:
 *                             The corresponding ({model.Collection}) object.
 */
Store.prototype.getCollectionInfo = function getCollectionInfo(collectionRef,
                                                               call) {
  assert.fail();
};

/**
 * @param {model.ClusterRef} clusterRef  Matches the clusters to get (label
 *                                       need not be set).
 * @param {service.Call} call  The service call context. Response:
 *                             {Object.{string, {Array.<string>}}
 *                             (the matching clusters IDs for each label).
 */
Store.prototype.getAllClusters = function getAllClusters(clusterRef, call) {
  assert.fail();
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
 * @param {!stack.Stack} stack  The storage stack: To handle a store call, it
 *                              might be necessary to perform other store calls.
 * @param {!service.callback} cb  Store initialization is async. The callback
 *                                will be called with the initialized store as
 *                                the success argument.
 */
StoreFactory.prototype.create = function create(conf, next, stack, cb) {
  assert.fail();
};

exports.Store = Store;
exports.StoreFactory = StoreFactory;
