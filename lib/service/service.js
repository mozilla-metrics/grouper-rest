var exports = module.exports = {};


/**
 * Standard callback/errback function signature.
 * @typedef {function(?(Object|string), ?(Object|string)}
 */
exports.callback;


/**
 * Wraps a service call. Handlers work with the subject and can use the
 * provided mechanisms to put a response to a stream.
 *
 * @interface
 */
function Call() {}


/**
 * Write result data to the response stream in the appropriate way.
 * For HTTP this means a header is set (if not already) and the data is
 * coded as UTF-8.
 *
 * @param {string} output The data to be sent.
 */
Call.prototype.write = function write(output) {};


/**
 * Respond with the given error in an appropriate way.
 * No argument:
 *
 * @param {?(string|Object)} An error, either just a string or an object
 *                           like this: {message: string, status: Number}
 *                           If omitted, a generic message is used.
 */
Call.prototype.error = function error(error) {};


/**
 * Respond using a callback. If the error is not null, respond using
 * error(error). Otherwise success is true (then finish) or an object to
 * send using write(output).
 *
 * @type {exports.callback}
 */
Call.prototype.cb = function(error, success) {};

exports.Call = Call;
