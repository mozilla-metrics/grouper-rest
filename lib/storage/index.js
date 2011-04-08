/**
 * The store middleware stack handles (async) PUTs and GETs.
 *
 * Each store on the stack can either handle a request, delegate it to
 * the next store, or make the request fail with an error.
 *
 * Each method of the stack modules takes a model reference or a model based
 * on which it performs some CRUD-related operation. Also, it takes a
 * service.Call object which is used to respond either by callback or by using
 * the provided stream.
 *
 * Stack containers can be tested separately. However when not using the
 * defaults module, make sure to specify references completely.
 *
 * The separate StackFactory makes sure you never deal with a partially
 * initialized stack.
 */
exports.StackFactory = require('./stack').StackFactory;

// The storage options
exports.hbase = require('./hbase_store');
exports.defaults = require('./defaults_store');

// Define more store modules using these interfaces.
exports.Store = require('./store').Store;
exports.StoreFactory = require('./store').StoreFactory;

exports.keys = {
    "simple": require('./keys/simple_keys'),
    "reverse_parts": require('./keys/reverse_parts_keys')
};
