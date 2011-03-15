var path = require('path')
  , fs = require('fs')
  , events = require('events')


var exports = module.exports = function(configFilePath) {
  var emitter = new events.EventEmitter()
  configFilePath = configFilePath || "./grouperconf.json"
  path.exists(configFilePath, function (exists) {
    if (!exists) {
      emitter.emit('error', "Configuration not found!")
      return
    }
    console.log("Using configuration file", path.resolve(configFilePath))
    fs.readFile(configFilePath, 'utf-8', function (err, contents) {
      if (err) {
        emitter.emit('error', "Could not read configuration!")
        return
      }
      var config = JSON.parse(contents)
      config.tableName = function(suffix) { return config.prefix + suffix }
      emitter.emit('configured', config)
    })
  })
  return emitter;
}
