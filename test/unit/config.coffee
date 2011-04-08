assert = require 'assert'

config = require 'config'


module.exports =
  "load test config": ->
    config './test/resources/testconf.json', (err) -> assert.ok !err

  "it calls back": (beforeExit) ->
    loaded = false
    config './test/resources/testconf.json', (err, conf) ->
      assert.ok !err
      loaded = true
    beforeExit -> assert.eql loaded, true

  "it has defaults": (beforeExit) ->
    called = false
    config null, (err, conf) ->
      called = true
      assert.eql conf.prefix, "grouperfish_"
      assert.eql conf.hbaseRest, "http://localhost:8080"
    beforeExit -> assert.ok called

  "it allows to configure stuff": (beforeExit) ->
    called = false
    config './test/resources/testconf.json', (err, conf) ->
      called = true
      assert.eql conf.hbaseRest, "http://localhost:8080"
      assert.eql conf.hbaseZk, "localhost:2181"
      assert.eql conf.prefix, "testfish_"
      assert.eql conf.restPort, "8031"
    beforeExit -> assert.ok called

  "it has factory extensions": (beforeExit) ->
    called = false
    config './test/resources/testconf.json', (err, conf) ->
      assert.ok !err
      called = true
      assert.ok conf.tableName
      assert.ok conf.hbaseClient
    beforeExit -> assert.ok called

  "it has defaults for fallback": (beforeExit) ->
    called = false
    config './test/resources/testconf.jzon', (err, conf) ->
      called = true
      assert.ok !err
      assert.eql conf.restPort, "8030"
    beforeExit -> assert.ok called
