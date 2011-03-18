assert = require 'assert'

query = require 'store/query'
stackFactory = require 'store/stack'


confEmitter = (require 'config') "test/resources/testconf.json"

testStore = (beforeExit, modules...) ->
  available = false
  added = 0
  failed = 0
  confEmitter.on 'error', -> assert.ok false
  confEmitter.on 'configured', (conf) ->
    stack = stackFactory conf
    for module in modules
      stack.push module
    stack.on 'storeAdded', (store) -> ++added
    stack.on 'storeFailed', (store) -> ++failed
    stack.on 'available', (store) -> available = true
    stack.on 'error', (err) -> assert.ok false
    stack.build()
  beforeExit ->
    assert.eql added, modules.length + 1
    assert.eql failed, 0
    assert.ok available

module.exports =
  "init noop stack": (beforeExit) ->
    called = false
    confEmitter.on 'error', () -> (assert.ok false)
    confEmitter.on 'configured', (conf) ->
      stack = stackFactory conf
      stack.on 'error', (err) ->
        console.log "error creating noop stack", err
        assert.ok false
      stack.on 'available', (store) -> called = true
      stack.build()
    beforeExit -> assert.ok called

  "init stack with defaults": (beforeExit) ->
    testStore beforeExit, (require "store/defaults")

  "init stack with hbase": (beforeExit) ->
    testStore beforeExit, (require "store/hbase")

  "init stack with hbase+defaults": (beforeExit) ->
    testStore beforeExit, (require "store/defaults"), (require "store/hbase")

  "try modifying sealed stack": (beforeExit) ->
    available = false
    pushFailed = false
    confEmitter.on 'error', -> assert.ok false
    confEmitter.on 'configured', (conf) ->
      stack = stackFactory conf
      stack.on 'storeFailed', (err) -> pushFailed = true
      stack.on 'available', (store) -> available = true
      stack.build()
      stack.push (require "store/defaults")
    beforeExit ->
      assert.ok available
      assert.ok pushFailed
