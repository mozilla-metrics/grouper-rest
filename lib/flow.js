/**
 * Decorator, returns a function that calls <tt>todo</tt>,
 * but only after <tt>event</tt> has happend at least once!
 *
 * Set the (optional) slotOrMethods to a method name, to replace the
 * decorated function with the original after the event has occurred.
 * This is mainly for efficiency, previous referents will still be able to
 * call the decorated version.
 *
 * If an *object* is passed as the third argument, decorate all methods of
 * that object so they wait on the given event. Methods are decorated
 * *in place* (the given object is returned by need(...)).
 */
function need (emitter, event, slotOrMethods, todoOrNothing) {
  if (slotOrMethods instanceof Object) {
    var o = slotOrMethods
    for (var k in o) if (o[k] instanceof Function)
      o[k] = need(emitter, event, k, o[k])
    return o
  }
  if (!todoOrNothing) {
    console.warn("Either 4 args (callback last) or 3 args (methods last)")
  }
  var slot = slotOrMethods || null
    , todo = todoOrNothing || function() {}
    , itHappened = false
  function waitForEvent () {
    if (itHappened) return todo.apply(this, arguments)
    var self = this
    var args = arguments
    emitter.once(event, function () {
      itHappened = true
      todo.apply(self, args)
      if (slot) self[slot] = todo
    })
  }
  return waitForEvent
}

var exports = module.exports = { need: need }
