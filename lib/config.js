/**
 * Loads configuration from a JSON file, optionally backed by defaults.
 *
 * Error/Success as usual:
 * js> (require 'config')('conf.json', function (err, conf) {...})
 */

var fail = require('assert').fail;
var path = require('path');
var fs = require('fs');
var url = require('url');

var hbase = require('hbase');


var HOME = path.resolve(process.env.GROUPERFISH_HOME
                        || path.join(process.cwd(), '../../'));
var DEFAULTS_PATH = path.join(HOME, './conf/defaults.json');
var CONFIG_PATH = path.join(HOME, './conf/grouperfish.json');


/**
 * @abstract
 * @constructor
 */
function Conf() {}

/**
 * @param {string} key Usually one of the keys listed in defaults.json
 * @return {!Object} value The corresponding config value or null if missing.
 */
Conf.prototype.get = function(key) { };


/**
 * @constructor
 * @implements {Conf}
 */
function MapConf(map) {
  map instanceof Object || fail();
  this.get = function get_(key) {
    return map[key];
  };
}

MapConf.prototype = new Conf;


function CompositeConf(upper, lower) {
  upper instanceof Conf || fail();
  lower == null || lower instanceof Conf || fail();

  this.get = function get_(key) {
    var upperVal = upper.get(key);
    if (upperVal !== undefined && upperVal !== null) return upperVal;
    if (!lower) return null;
    return lower.get(key);
  };

}


/** Initialized the configuration from defaults and user configuration. */
var exports = module.exports = function (configPath, cb) {

  configPath = configPath || CONFIG_PATH;


  fromFile(DEFAULTS_PATH, function (err, defaultsConf) {
    if (err) {
      console.log("Could not load configuration defaults!", err.message);
    }
    fromFile(configPath, function (err, userConf) {
      if (err) {
        if (defaultsConf) {
          return cb(null, defaultsConf);
        }
        console.log("Failed to initialize configuration!", err.message);
        return cb(err);
      }
      if (defaultsConf) {
        return cb(null, new CompositeConf(userConf, defaultsConf));
      }
      return cb(null, userConf);
    });
  });


  /** Update conf in-place from the given JSON file. */
  function fromFile(relativePath, cb) {

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
        cb(null, new MapConf(JSON.parse(contents)));
      });
    });
  }

};
