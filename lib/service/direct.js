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

  // so we added this to HTTP call, we gotta support it :/
  this.okTextPlain = function okTextPlain_() {}

  this.cb = function cb_(err, success) {
    if (err) return cb(err);
    if (!gobbler.length) return cb(null, success);
    success === true || fail();
    result = gobbler.join('');
    try {
      result = JSON.parse(result);
    }
    catch (error) {
      // Not JSON (putDocument)
      // TODO: Our REST API is flawed, we want to always return JSON here...
    }
    cb(null, result);
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
