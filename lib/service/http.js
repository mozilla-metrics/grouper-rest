var service = require('service');


var HEADERS = {"Content-Type", "application/json"};

/**
 * Service call over HTTP+JSON.
 *
 * @implements service.Call
 *
 * @param {http.ServerResponse} response
 * @param {?service.callback} cb  An optional custom callback. The default
 *                                callback stringifies successfull responses to
 *                                JSON (apart from when streaming was used).
 * @returns
 */
function HttpCall(response, cb) {

  var self = this;

  self.subject = function subject() {
    return subject;
  };

  self.write = function writeFirst(output) {
    if (!headersSent) {
      headers(200);
    }
    writeMore(output);
  };

  self.error = function error(error) {
    if (error === null) {
      error = {message: "An error occurred!", status: 500};
    }
    else if (typeof(error) === "string") {
      error = {message: error, status: 500};
    }

    response.writeHead(error.status, error.message, HEADERS);
    response.write(error.message);
  };

  self.cb = cb || function cb(error, success) {
    if (error) return self.error(error);
    if (headersSent) return;
    self.write(JSON.stringify(success);
  };


  var headersSent = false;

  function headers(status) {
    if (headersSent) {
      response.write("Error 500. Headers already sent.");
    }
    response.writeHead(status, "OK", HEADERS);
    headersSent = true;
  }

  function writeMore(output) {
    response.write(output);
  }

}

HttpCall.prototype = new service.Call();


module.exports.createHttpCall: function createHttpCall(response, cb) {
  response || assert.fail();
  return new HttpCall(response, cb);
};
