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

var path = require('path');
var fs = require('fs');
var url = require('url');

var hbase = require('hbase');


var HOME = path.resolve(process.env.GROUPERFISH_HOME
                        || path.join(process.cwd(), '../../'));
var DEFAULTS_PATH = path.join(HOME, './conf/defaults.json');
var CONFIG_PATH = path.join(HOME, './conf/grouperfish.json');


var exports = module.exports = function (configPath, cb) {

  configPath = configPath || CONFIG_PATH;

  var hasDefaults = false;
  var conf = {};


  function withFactories(conf) {
    var keys = require('storage').keys[conf.keyScheme];

    conf.keys = function() { return keys; };
    conf.tableName = function(suffix) { return conf.prefix + suffix; };
    conf.hbaseClient = function() {
      var parts = url.parse(conf.hbaseRest);
      return hbase({'host': parts.hostname, 'port': parts.port});
    };

    return conf;
  }


  /** Update conf in-place from the given JSON file. */
  function updateConfig(relativePath, cb) {

    var absPath = path.resolve(relativePath);

    path.exists(absPath, function (exists) {
      if (!exists) {
        return cb({message: ['File missing: ', absPath, ''].join("'")});
      }
      fs.readFile(absPath, 'utf-8', function (err, contents) {
        if (err) {
          var message = ['Cannot read: ', absPath, ', ', err, ''].join("'");
          return cb({message: message});
        }
        var map = JSON.parse(contents);
        for (var k in map) conf[k] = map[k];
        cb(null, conf);
      });
    });

  }


  updateConfig(DEFAULTS_PATH, function (err) {
    hasDefaults = !err;
    if (err) {
      console.log("Could not load configuration defaults!", err.message);
      conf = {};
    }
    updateConfig(configPath, function (err) {
      if (err && !hasDefaults) {
        console.log("Failed to initialize configuration!", err.message);
        return cb(err);
      }
      return cb(null, withFactories(conf));
    });
  });

};
