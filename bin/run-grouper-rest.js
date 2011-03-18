var server = require('../lib/grouper-rest')
  , configFactory = require('../lib/config')

if (process.argv.length < 3) {
  console.log("usage: node", process.argv[1], "CONFIG_FILE_PATH")
  process.exit(1)
}

var config = configFactory(process.argv[2])
config.on('error',  function (reason) {
  console.log("Could not initialize configuration:", reason)
})
config.on('configured', function (config) {
  server.start(config, function(err, server) {
    console.log("Starting server on port", config.restPort)
    server.listen(config.restPort)
  })
})
