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
      assert.eql (conf.get "general:prefix"), "grouperfish_"
      assert.eql (conf.get "storage:hbase:rest"), "http://localhost:8080"
    beforeExit -> assert.ok called

  "it allows to configure stuff": (beforeExit) ->
    called = false
    config './test/resources/testconf.json', (err, conf) ->
      called = true
      assert.eql (conf.get "storage:hbase:rest"), "http://localhost:8080"
      assert.eql (conf.get "storage:hbase:zookeeper:quorum"),
                 "localhost:2181"
      assert.eql (conf.get "general:prefix"), "testfish_"
      assert.eql (conf.get "rest:port"), "8031"
    beforeExit -> assert.ok called

  "it has defaults for fallback": (beforeExit) ->
    called = false
    config './test/resources/testconf.jzon', (err, conf) ->
      called = true
      assert.ok !err
      assert.eql (conf.get "rest:port"), "8030"
    beforeExit -> assert.ok called
