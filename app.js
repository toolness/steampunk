var storage = require('./storage.js').configure({
      rootDir: process.env['STORAGE_ROOT_DIR'] || __dirname + '/storage-data'
    }),
    server = require('./server'),
    port = process.env['PORT'] || 3000;

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function() {
  console.log("Farewell.");
});

process.on('uncaughtException', function(err) {
  console.error("UNCAUGHT EXCEPTION", err);
});

storage.load('config', function(err, config) {
  if (err) throw err;

  config = config.get();

  if (Object.keys(config).length == 0) {
    console.log('Please copy config.sample.json to storage-data/' +
                'config.json and edit it. See README.md for more details.');
    process.exit(1);
  }
  if (config.config) config = config.config; // support older schema

  config.audience = process.env['PERSONA_AUDIENCE'] || config.audience;

  if (!config.audience) {
    console.log('Please set the PERSONA_AUDIENCE environment variable ' +
                'or define config.audience. See README.md for more details.');
    process.exit(1);
  }

  server.createApp(storage, config, function(err, app) {
    if (err) throw err;
    app.listen(port, function() {
      console.log("listening on port " + port);
    });
  });
});
