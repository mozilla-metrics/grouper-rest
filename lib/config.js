/**
 * Loads configuration from a JSON file.
 * Adds
 *   tableName(suffix)  for namespaced tables (e.g. shared hbase)
 *   hbase()            a pre-configured node-hbase client
 *
 * Clients should subscribe to the 'configured' event:
 * js> (require 'config')('conf.json').on('configured', function (conf) {...})
 */

var path = require('path')
  , fs = require('fs')
  , events = require('events')
  , hbase = require('hbase')
  , url = require('url')


var exports = module.exports = function(configFilePath) {
  var emitter = new events.EventEmitter()
  absPath = path.resolve(configFilePath || './grouperconf.json')
  path.exists(configFilePath, function (exists) {
    if (!exists) {
      emitter.emit('error', 'Configuration not found:', absPath)
      return
    }

    console.log('Using configuration file', absPath)
    fs.readFile(configFilePath, 'utf-8', function (err, contents) {
      if (err) {
        emitter.emit('error', 'Could not read configuration!', absPath)
        return
      }
      var conf = JSON.parse(contents)
      conf.tableName = function(suffix) { return conf.prefix + suffix }
      conf.hbaseClient = function() {
        var parts = url.parse(conf.hbaseRest)
        return hbase({'host': parts.hostname, 'port': parts.port})
      }
      emitter.emit('configured', conf)
    })
  })
  return emitter;
}
