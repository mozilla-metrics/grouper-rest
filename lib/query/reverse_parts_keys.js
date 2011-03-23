function rev(str) {
  return str.split('').reverse().join('')
}

/**
 * These keys are a bit smarter than the simple keys: They reverse the
 * document-ids and the timestamps, for a better row-key distribution, but
 * still being easily inverted by looking hard at them.
 */
module.exports = {

  toString: function () {
    return '[query:keys:reverse_parts]'
  }

, doc: function (q) {
    return [q.ns, q.ck, rev(q.id)].join('/')
  }

, collection: function (q) {
    return [q.ns, q.ck].join('/')
  }

, cluster: function (q) {
    return [q.confName, q.ns, q.ck, rev(q.ts), q.label].join('/')
  }

  /**
   * Makes a glob key since this is not actually a unit of storage.
   * Remember when handling with something other than hbase-rest glob-get.
   */
, allClusters: function (q) {
    return [q.confName, q.ns, q.ck, rev(q.ts), '*'].join('/')
  }

}
