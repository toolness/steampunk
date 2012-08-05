var app = require('../../app'),
    spawn = require('child_process').spawn;

app.listen(8051, function() {
  console.log('running browser-based tests using phantomjs.');
  var phantom = spawn('phantomjs', [__dirname + '/phantom.js']);
  phantom.stdout.setEncoding('utf8');
  phantom.stderr.setEncoding('utf8');
  phantom.stdout.on('data', function(chunk) { console.log(chunk); });
  phantom.stderr.on('data', function(chunk) { console.log(chunk); });
  phantom.on('exit', function(status) {
    console.log('phantomjs exited with code', status);
    process.exit(status);
  });
});
