// Have row key generation in one place, so we can change it anytime, e.g.
// to use MD5 keys for easier region sharding.

exports = {
  document: function(namespace, collectionKey, id) {
    return [namespace, collectionKey, id].join('/')
  }
, collection: function(namespace, collectionKey) {
    return [namespace, collectionKey].join('/')
  }
, cluster: function(namespace, collectionKey, clusterLabel) {
    return [namespace, collectionKey, clusterLabel].join('/')
  }
}
