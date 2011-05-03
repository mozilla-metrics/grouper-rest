var fail = require('assert').fail;

var Call = require('./service').Call;


var HEADERS = {"Content-Type":"application/json"};

/**
 * Service call over HTTP+JSON.
 *
 * @implements {Call}
 *
 * @param {http.ServerResponse} response
 * @param {?service.callback} cb  An optional custom callback. The default
 *                                callback stringifies successfull responses to
 *                                JSON (apart from when streaming was used).
 * @param {?number}  The success status (default: 200). You may want to use 201
 *                   or 202 for successfull POSTs.
 *
 * @returns
 */
function HttpCall(response, cb, successStatus) {

  var self = this;
  var headersSent = false;
  successStatus = successStatus || 200;

  function writeMore(output) {
    response.write(output);
  }

  function headers(status) {
    if (headersSent) {
      response.write("Error 500. Headers already sent.");
    }
    response.writeHead(status, "OK", HEADERS);
    headersSent = true;
  }

  this.write = function write_(output) {
    if (!headersSent) {
      headers(successStatus);
    }
    writeMore(output);
    self.write = writeMore;
  };

  this.error = function error_(error) {
    if (error === null) {
      error = {message: "An error occurred!", status: 500};
    }
    else {
      var orig = error;
      error = {};
      error.message = '' + (orig.message || orig.text || orig);
      error.status = '' + (orig.status || orig.code || 500);
    }

    console.log("ERR: Service request failed with %s, message: %s",
                error.status, error.message);
    response.writeHead(error.status, error.message, HEADERS);
    response.write(JSON.stringify(error));
    response.end();
  };

  this.cb = cb || function cb_(error, success, optionalStatus) {
    if (error) return self.error(error);
    if (headersSent) success === true || fail();
    else self.write(JSON.stringify(success));
    response.end();
  };

}

HttpCall.prototype = new Call();


module.exports.createHttpCall = function createHttpCall(response, cb) {
  response || fail();
  return new HttpCall(response, cb);
};
