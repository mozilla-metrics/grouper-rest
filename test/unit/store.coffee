assert = require 'assert'

query = require 'query/query'
stackFactory = require 'store/stack'
config = (require 'config')

TEST_CONF = "test/resources/testconf.json"

testStore = (beforeExit, modules...) ->
  available = false
  added = 0
  failed = 0
  config TEST_CONF, (err, conf) ->
    assert.ok !err
    assert.ok conf != null
    stack = stackFactory conf
    for module in modules
      stack.push module
    stack.on 'storeAdded', (store) -> ++added
    stack.on 'storeFailed', (store) -> ++failed
    stack.build (err, store) ->
      if err then console.log "Store err: ", err, ", store: ", store
      assert.ok !err
      available = true
  beforeExit ->
    assert.eql added, modules.length + 1
    assert.eql failed, 0
    assert.ok available

module.exports =
  "init noop stack": (beforeExit) ->
    called = false

    config TEST_CONF, (err, conf) ->
      assert.ok !err
      stack = stackFactory conf
      stack.build (err, store) ->
        if err then assert.ok false
        called = true
    beforeExit -> assert.ok called

  "init stack with defaults": (beforeExit) ->
    testStore beforeExit, (require "store/defaults")

  "init stack with hbase": (beforeExit) ->
    testStore beforeExit, (require "store/hbase")

  "try modifying sealed stack": (beforeExit) ->
    available = false
    pushFailed = false
    config TEST_CONF, (err, conf) ->
      assert.ok !err
      assert.ok conf != null
      stack = stackFactory conf
      stack.on 'storeFailed', (err) -> pushFailed = true
      stack.build (err, store) ->
        if err then return
        available = true
      stack.push (require "store/defaults")

    beforeExit ->
      assert.ok available
      assert.ok pushFailed
