config = require 'config'

storage = require 'storage'
StackFactory = storage.StackFactory
url = require 'url'

chain = (require 'slide').chain
asyncMap = (require 'slide').asyncMap

fixtures = require '../resources/fixtures'


exports.setup = (cb) ->
  config 'test/resources/testconf.json', (err, conf) ->
    # storage.hbase.factory.createAdmin(conf).reset (err) ->
      # 503: tables do not exist in the first place
      if err then assert.ok err.code == 503

      factory = new StackFactory conf
      factory.push storage.hbase.factory
      factory.build (store) ->
        client = hbaseClient conf
        list = for tableId, contents of fixtures
          [load, client, (tableName conf, tableId), contents]
        chain list, (err, success) ->
          cb err, conf


exports.update = (exports, tests) ->
  for name, test of tests
    exports[name] = test


load = (client, tableName, contents, cb) ->
  "Load the passed contents into the given table."
  puts = []

  putNested = (value, cKey) ->
    if typeof(cell) == "string" or typeof(cell) == "number"
      puts.push {key: key, column: cKey, '$': cell}
    else
      for ts, value of cell
        puts.push {key: key, column: cKey, timestamp: ts, '$': value}

  for key, families of contents
    for family, columns of families
      for qualifier, cell of columns
        putNested cell, [family, qualifier].join ':'

  table = client.getRow tableName, null
  table.put puts, (err, success) ->
    if err then return cb err
    return cb null, success


hbaseClient = (conf) ->
  restUrl = conf.get "storage:hbase:rest"
  if not restUrl then assert.fail()
  parts = url.parse restUrl;
  return require('hbase') {'host': parts.hostname, 'port': parts.port}


tableName = (conf, suffix) ->
  prefix = conf.get "general:prefix"
  if not prefix then assert.fail()
  return prefix + suffix;
