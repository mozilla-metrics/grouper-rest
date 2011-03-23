var assert = require('assert')

var exports = module.exports = {
  forDocument: function (namespace, collectionKey, id) {
    namespace && namespace.length || assert.fail()
    collectionKey && collectionKey.length || assert.fail()
    id && id.length || assert.fail()
    return {
      ns: namespace
    , ck: collectionKey
    , id: id
    }
  }
, forCluster: function (namespace, collectionKey, label, maybeTimestamp) {
    namespace && namespace.length || assert.fail()
    collectionKey && collectionKey.length || assert.fail()
    label && label.length || assert.fail()
    if (!label || !collectionKey || !namespace) {
      throw {message: "namespace, collectionKey and label are required"}
    }
    return {
      confName: "DEFAULT"
    , ns: namespace
    , ck: collectionKey
    , ts: maybeTimestamp || null
    , label: label
    }
  }
, forAllClusters: function (namespace, collectionKey, maybeTimestamp) {
    namespace && namespace.length || assert.fail()
    collectionKey && collectionKey.length || assert.fail()
    return {
      confName: "DEFAULT"
    , ns: namespace
    , ck: collectionKey
    , ts: maybeTimestamp || null
    }
  }
}
