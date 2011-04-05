var EventEmitter = require('events').EventEmitter;
var chain = require('slide').chain;
var bottom = require('./bottom');


/**
 * The store middleware stack handles async PUTs and GETs.
 *
 * Each store module on the stack can either handle a request, delegate it to
 * the next module, or fail by calling the callback with the first argument.
 *
 * Each method of the stack modules takes a query, defined by the query module,
 * and a callback function. Results are either produced directly by using the
 * callback with the second argument, or incrementally by writing them to the
 * query.stream.write method. After a response has been written incrementally,
 * the callback is called without arguments to signal completion.
 *
 * Stack containers can be tested separately. However when using the defaults
 * module, make sure to specify queries completely.
 */
var exports = module.exports = function (conf) {

  var api = new EventEmitter();
  var modules = [];
  var sealed = false;

  /**
   * Initializeds all the storage modules in a chain, from bottom to top.
   * When build has been called, no more storage modules can be added.
   *
   * @param {Function} cb The callback receiving an error, or the initialized
   *                      stack.
   */
  api.build = function build (cb) {
    sealed = true;

    function push(module, next, stack, cb_) {
      function report (err, api) {
        if (err) {
          stack.emit('storeFailed', module.name, err);
          return cb_(err, null);
        }
        stack.emit('storeAdded', module.name, api);
        return cb_(null, api);
      }
      module(conf, next, stack, report);
    }

    var input = [[push, bottom, null, stack]];
    modules.forEach(function initStoreModule (module) {
      input.push([push, module, chain.last, api]);
    });

    chain(input, function finishStackInit (err, apis) {
      if (err) return cb(err);
      top = apis.pop();
      api.top = function() { return top };
      return cb(null, top);
    });

    return api;
  };

  api.push = function push (module) {
    if (sealed) {
      return api.emit('storeFailed', 'Cant add store: Stack is sealed.');
    }
    modules.push(module);
    return api;
  };

  api.top = function top () {
    api.emit('error', 'storage API not yet "available"')
  };

  return api;
};
