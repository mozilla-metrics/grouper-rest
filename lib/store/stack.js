var Emitter = require('events').EventEmitter
var chain = require('slide').chain

var bottom = require('./bottom')


/**
 * The store middleware stack handles async PUTs and GETs.
 * Stack containers can be tested separately.
 *
 * When all storage containers have been initialized, the 'available' event
 * is emitted.
 */
var exports = module.exports = function (conf, m1, m2) {
  var args = Array.prototype.slice.call(arguments)
    , conf = args.shift()
    , modules = args
  var stack = {}
    , emitter = new Emitter()

  function push(module, next, stack, cb) {
    function report (err, api) {
      if (err) {
        emitter.emit("storeFailed", module.name, err)
        cb(err, null)
      }
      emitter.emit("storeAdded", module.name, api)
      cb(null, api)
    }
    module(conf, next, stack, report)
  }

  var list = [[push, bottom, null, stack]]
  modules.forEach(function(m) {
    list.push([push, m, chain.last, stack])
  })

  var results = []
  chain(list, results, function(err, apis) {
    if (err) {
      return emitter.emit('error', err)
    }
    top = apis.pop()
    stack.top = function() { return top }
    emitter.emit("available", top)
  })

  stack.top = function() {
    emitter.emit('error', 'storage API not yet "available"')
  }

  return emitter
}
