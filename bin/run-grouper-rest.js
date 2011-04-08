var serverFactory = require('grouper-rest');
var configFactory = require('config');


function usage(status) {
  console.log("usage: node", process.argv[1], "COMMAND", "[CONFIG_FILE_PATH]")
  return process.exit(status);
}

String.fromCharCode(0);
/** reads a chunk of input */
function readString(cb) {
  process.stdin.resume();
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", function (data) {
    cb(null, data);
    process.stdin.pause();
  });
}


function main(args) {
  if (!args.length) return usage(1);
  var command = args[0],
      parameters = args.slice(1);

  switch (command) {
    case "help":
    case "--help":
      return usage(0);

    case "run":
      return run.apply(null, parameters);

    case "reset":
      return reset.apply(null, parameters);

    default:
      return usage(1);
  }
}


function reset(configPath) {
  configFactory(configPath, function (err, conf) {
    if (err) throw err;
    console.log("About to obliterate %s* -- 'Yes' to proceed.", conf.prefix);
    readString(function (err, str) {
      if (str != "Yes\n" ) {
        console.log("aborted");
        process.exit(1);
      }
      var admin = require('store').hbase.HBaseAdmin(conf);
      admin.reset(function (err, success) {
        console.log("Tables '%s*' reset", conf.prefix);
      });
    });
  });
}


function run(configPath) {
  configFactory(configPath, function (err, conf) {
    if (err) throw err;
    serverFactory.start(conf, function (err, server) {
      console.log("Starting server on port", conf.restPort);
      server.listen(conf.restPort);
    });
  });
}


if (!module.parent) {
  main(process.argv.slice(2));
};

