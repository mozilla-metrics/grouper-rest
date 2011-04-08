var fail = require('assert').fail;

var chain = require('slide').chain;

var bottom = require('./bottom_store');
var StoreFactory = require('./store').StoreFactory,
    Store = require('./store').Store;


function StackFactory(conf) {

  conf || fail();

  var self = this;
  var factories = [];


  /**
   * Initializes all the storage modules in a chain, from bottom to top.
   *
   * @param {Function} cb  Callback getting an error or the top {Store} of the
   *                       initialized stack.
   */
  this.build = function build_(cb) {

    /** Passed to store modules so that they can (later) access the top. */
    var top_ = null;
    function top() { return top_; };

    function add(factory, next, chainCb) {
      function storeDone(err, store) {
        store instanceof Store || fail();
        if (err) return chainCb(err, null);
        return chainCb(null, store);
      }
      factory.create(conf, next, top, storeDone);
    }

    var initializers = [];
    factories.forEach(function (factory) {
      initializers.push([add, factory, chain.last]);
    });
    chain(initializers, function stackDone(err, stores) {
      if (err) return cb(err);
      top_ = stores.pop();
      return cb(null, top_);
    });

  };


  /**
   * @param {StoreFactory} factory
   * @return {StackFactory} self
   */
  this.push = function push_(storeFactory) {
    storeFactory instanceof StoreFactory || fail();
    factories.push(storeFactory);
    return self;
  };

  self.push(bottom.factory);

};

module.exports.StackFactory = StackFactory;
