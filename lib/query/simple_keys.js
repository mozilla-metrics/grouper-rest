module.exports = {

  toString: function () {
    return '[query:keys:simple]'
  }

, doc: function (q) {
    return [q.ns, q.ck, q.id].join('/')
  }

, collection: function (q) {
    return [q.ns, q.ck].join('/')
  }

, cluster: function (q) {
    return [q.confName, q.ns, q.ck, q.ts, q.label].join('/')
  }

  /**
   * Makes a glob key since this is not actually a unit of storage.
   * Remember when handling with something other than hbase-rest glob-get.
   */
, allClusters: function (q) {
    return [q.confName, q.ns, q.ck, q.ts, '*'].join('/')
  }
}
