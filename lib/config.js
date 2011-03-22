/**
 * This is factory as well as configuration, as well as the source for
 * configuration values. It knows about separation of concerns, it just
 * does not care. It knows it will be the next god object, and it feels
 * good about it...
 * JK: This thing works for now, but will need to be refactored.
 *
 * Loads configuration from a JSON file.
 *
 * Adds factory methods:
 *   tableName(suffix)  for namespaced tables (e.g. shared hbase)
 *   hbaseClient()      a pre-configured node-hbase client
 *   keys()             the configured generator for keys from querys
 *
 * Error/Success as usual:
 * js> (require 'config')('conf.json', function (err, conf) {...})
 */

var path = require('path')
  , fs = require('fs')
  , events = require('events')
  , hbase = require('hbase')
  , url = require('url')

// TODO: read defaults from json file, so we can share them with java
var DEFAULTS = {
  keyScheme: "query/simple_keys"
}

var exports = module.exports = function(configFilePath, cb) {

  absPath = path.resolve(configFilePath || './grouperconf.json')
  path.exists(absPath, function (exists) {
    if (!exists) {
      var message = ['Configuration missing: ', absPath, ''].join("'")
      cb({message: message})
    }

    fs.readFile(absPath, 'utf-8', function (err, contents) {
      if (err) {
        var message = ['Cannot read: ', absPath, ', ', err, ''].join("'")
        return cb({message: message})
      }
      var conf = JSON.parse(contents)
      for (var k in DEFAULTS) {
        if (!(k in conf)) conf[k] = DEFAULTS[k]
      }
      var keys = require(conf.keyScheme)

      conf.keys = function() {
        return keys
      }
      conf.tableName = function(suffix) {
        return conf.prefix + suffix
      }
      conf.hbaseClient = function() {
        var parts = url.parse(conf.hbaseRest)
        return hbase({'host': parts.hostname, 'port': parts.port})
      }

      cb(null, conf)
    })
  })
}
