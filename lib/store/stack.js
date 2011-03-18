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
var exports = module.exports = function (conf) {
  var modules = []
  var stack = new Emitter()
    , sealed = false

  stack.build = function(cb) {
    sealed = true

    function push(module, next, stack, cb_) {
      function report (err, api) {
        if (err) {
          stack.emit('storeFailed', module.name, err)
          cb_(err, null)
        }
        stack.emit('storeAdded', module.name, api)
        cb_(null, api)
      }
      module(conf, next, stack, report)
    }

    var input = [[push, bottom, null, stack]]
    modules.forEach(function(m) {
      input.push([push, m, chain.last, stack])
    })
    chain(input, function(err, apis) {
      if (err) return cb(err)
      top = apis.pop()
      stack.top = function() { return top }
      cb(null, top)
    })

    return stack
  }

  stack.push = function(module) {
    if (sealed) return stack.emit('storeFailed',
                                  'Cant add store. Stack sealed.')
    modules.push(module)
    return stack
  }

  stack.top = function() {
    stack.emit('error', 'storage API not yet "available"')
  }

  return stack
}
