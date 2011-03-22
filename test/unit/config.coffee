assert = require 'assert'

config = (require 'config')


module.exports =
  "load test config": ->
    config './test/resources/testconf.json', (err) -> assert.ok !err

  "check event": (beforeExit) ->
    loaded = false
    config './test/resources/testconf.json', (err, conf) ->
      assert.ok !err
      loaded = true
    beforeExit -> assert.eql loaded, true

  "config values": (beforeExit) ->
    called = false
    config './test/resources/testconf.json', (err, conf) ->
      called = true
      assert.eql conf.hbaseRest, "http://firefly:8890"
      assert.eql conf.hbaseZk, "localhost:2181"
      assert.eql conf.prefix, "testfish_"
      assert.eql conf.restPort, "8031"
    beforeExit -> assert.ok called

  "config extenstions": (beforeExit) ->
    called = false
    config './test/resources/testconf.json', (err, conf) ->
      assert.ok !err
      called = true
      assert.ok conf.tableName
      assert.ok conf.hbaseClient
    beforeExit -> assert.ok called

  "check missing config event": (beforeExit) ->
    failed = false
    config './test/resources/testconf.jzon', (err) ->
      if err then failed = true
    beforeExit -> assert.ok failed
