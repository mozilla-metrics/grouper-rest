assert = require 'assert'

config = (require 'config')


module.exports =
  "load test config": ->
    e = config './test/resources/testconf.json'
    e.on 'error', () -> (assert.ok false)

  "check event": (beforeExit) ->
    e = config './test/resources/testconf.json'
    loaded = false
    e.on 'configured', (conf) -> loaded = true
    beforeExit -> assert.eql loaded, true

  "config values": (beforeExit) ->
    e = config './test/resources/testconf.json'
    called = false
    e.on 'configured', (conf) ->
      called = true
      assert.eql conf.hbaseRest, "http://firefly:8890"
      assert.eql conf.hbaseZk, "localhost:2181"
      assert.eql conf.prefix, "testfish_"
      assert.eql conf.restPort, "8031"
    beforeExit -> assert.ok called

  "config extenstions": (beforeExit) ->
    e = config './test/resources/testconf.json'
    called = false
    e.on 'configured', (conf) ->
      called = true
      assert.ok conf.tableName
      assert.ok conf.hbaseClient
    beforeExit -> assert.ok called

  "check missing config event": (beforeExit) ->
    e = config './test/resources/testconf.jzon'
    failed = false
    e.on 'error', () -> failed = true
    beforeExit -> assert.ok failed
