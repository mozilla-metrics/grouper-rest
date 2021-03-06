var fail = require('assert').fail;

var DocumentRef = require('model').DocumentRef,
    CollectionRef = require('model').CollectionRef,
    ClusterRef = require('model').ClusterRef;


/**
 * Generates keys from model references.
 *
 * Two functions can be given to rewrite parts of the keys can be given. If not,
 * identity is used.
 *
 * @param {string}
 * @param {?function(string, string): string} pairKey
 * @param {?function(string): string} itemKey
 */
module.exports = function (scheme, pairKey, itemKey) {

  pairKey = pairKey || function defaultPairKey(first, second) {
    return [first, second].join('/');
  };

  itemKey = itemKey || function defaultItemKey(item) {
    return item;
  };


  return {
    toString: function () {
      return '[keys::' + scheme + ']';
    },

    /**
     * @param {!DocumentRef} documentRef A document reference
     * @return {string} An hbase row key to lookup the corresponding document.
     */
    document: function document_(docRef) {
      docRef instanceof DocumentRef || fail();
      return [pairKey(docRef.ownerRef().namespace(), docRef.ownerRef().key()),
              itemKey(docRef.id())].join('/');
    },

    /**
     * @param {!Object} collectionRef A reference to a collection.
     * @return {string} The corresponding row key.
     */
    collection: function collection_(collectionRef) {
      collectionRef instanceof CollectionRef || fail();
      return pairKey(collectionRef.namespace(), collectionRef.key());
    },

    /**
     * @param {!Object} clusterRef
     * @return {string} The corresponding row key.
     */
    cluster: function cluster_(clusterRef) {
      clusterRef instanceof ClusterRef || fail();
      return [clusterRef.confName(),
              pairKey(clusterRef.ownerRef().namespace(),
                      clusterRef.ownerRef().key()),
              itemKey(clusterRef.timestamp()),
              clusterRef.label()].join('/');
    },

    /**
     * Makes a glob key since this is not actually a unit of storage.
     * Remember when handling with something other than hbase-rest glob-get.
     *
     * @param {!Object} clusterRef
     * @return {string} The corresponding hbase glob-get key.
     */
    allClusters: function allClusters_(clusterRef) {
      clusterRef instanceof ClusterRef || fail();
      return [clusterRef.confName(),
              pairKey(clusterRef.ownerRef().namespace(),
                      clusterRef.ownerRef().key()),
              itemKey(clusterRef.timestamp()),
              ''].join('/');
    }
  };

};
