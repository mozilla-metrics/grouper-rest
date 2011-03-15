var fs = require('fs')


var exports = module.exports = 
  JSON.parse(fs.readFileSync('grouperconf.json', 'utf-8'))

exports.tableName = function(suffix) {
  return exports.prefix + suffix
}
