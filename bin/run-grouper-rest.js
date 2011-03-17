var server = require('../lib/grouper-rest').server
  , config = require('../lib/config')


config(process.argv[2])
config.on('error',  function (reason) {
  console.log("Could not initialize configuration:", reason)
})
config.on('configured', function (config) {
  server(config, function(server) { server.listen(config.restPort) })
})
