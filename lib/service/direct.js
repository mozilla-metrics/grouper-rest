var fail = require('assert').fail;

var Call = require('./service').Call;


/**
 * In-memory service call for immediate processing of results.
 *
 * @implements {Call}
 *
 * @param {!service.callback} cb  A required callback to get the result.
 *                                If the (JSON) result was streamed in, the
 *                                decoded version will be passed.
 */
function DirectCall(cb) {

  var gobbler = [];

  this.error = function error_(error) {
    if (error === null) {
      error = {message: "An error occurred!"};
    }
    else if (typeof(error) === "string") {
      error = {message: error};
    }
    cb(error);
  };

  this.cb = function cb_(err, success) {
    if (err) return cb(err);
    if (!gobbler.length) return cb(null, success);
    success === true || fail();
    cb(null, JSON.decode(gobbler.join('')));
  };

  this.write = function write_(output) {
    gobbler.push(output);
  };
}

DirectCall.prototype = new Call();


module.exports.createDirectCall = function createDirectCall(cb) {
  cb || fail();
  return new DirectCall(cb);
};
