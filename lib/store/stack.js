/** 
 * The store middleware stack handles async PUTs and GETs. 
 * Stack containers can be tested separately.
 */
var exports = module.exports = function (config) {
  var top
    , stack = {}

  stack.top = function () { return top }
  stack.push = function (module) {
    top = module(config, top, stack)
    return stack
  }
  stack.push(require('./bottom'))
  
  return stack
}
