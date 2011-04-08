assert = require 'assert'

model = require 'model'
StackFactory = (require 'storage').StackFactory
config = require 'config'


TEST_CONF = "test/resources/testconf.json"

testStore = (beforeExit, modules...) ->
  available = false
  config TEST_CONF, (err, conf) ->
    assert.ok !err
    assert.ok conf != null
    factory = new StackFactory conf
    for module in modules
      factory.push module.factory
    factory.build (err, store) ->
      if err then console.log "Store err: ", err, ", store: ", store
      assert.ok !err
      available = true
  beforeExit ->
    assert.ok available

module.exports =
  "init noop stack": (beforeExit) ->
    called = false

    config TEST_CONF, (err, conf) ->
      assert.ok !err
      factory = new StackFactory conf
      factory.build (err, store) ->
        if err then assert.ok false
        called = true
    beforeExit -> assert.ok called

  "init stack with defaults": (beforeExit) ->
    testStore beforeExit, (require 'storage').defaults

  "init stack with hbase": (beforeExit) ->
    testStore beforeExit, (require 'storage').hbase

  "stack immutability": (beforeExit) ->
    first = null
    config TEST_CONF, (err, conf) ->
      assert.ok !err
      assert.ok conf != null

      factory = new StackFactory conf
      factory.build (err, first_) ->
        assert.ok first_
        first = first_

      factory.push (require 'storage').defaults.factory
      factory.build (err, second) ->
        assert.ok second
        assert.ok first != second
