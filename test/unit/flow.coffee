assert = require 'assert'

need = (require 'flow').need
config = (require 'config') './test/resources/testconf.json'


x = "?"
runs = 0
lock = new (require 'events').EventEmitter()

config.on 'configured', (conf) ->
  x = "!"
  lock.emit "unlock"

delayed = (i) ->
  () -> assert.eql x, "!"; ++runs

methods =
  'test1': delayed 2
  'test2': delayed 3
  'test3': delayed 4

later = need lock, "unlock", null, (delayed 1)

module.exports =
  start: -> assert.eql x, "?"
  asyncOne: ->
    assert.eql x, "?"
    later()
  asyncMulti: ->
    laters = need lock, "unlock", methods
    i = 0
    for k, f of laters
      ++i
      laters[k]()
    assert.eql i, 3

  asyncCheck: (beforeExit) ->
    check = -> assert.eql x, "!"; assert.eql runs, 4
    beforeExit check

  syncUnlocked: (beforeExit) ->
    # the event has been emitted, calling should still work
    check = -> later(); assert.eql runs, 5
    beforeExit check
