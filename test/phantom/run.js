var app = require('../../app'),
    spawn = require('child_process').spawn;

const PHANTOMJS = 'phantomjs' || process.env['PHANTOMJS'];

function start() {
  app.listen(8051, function() {
    console.log('running browser-based tests using phantomjs.');
    var phantom = spawn(PHANTOMJS, [__dirname + '/phantom.js']);
    phantom.stdout.setEncoding('utf8');
    phantom.stderr.setEncoding('utf8');
    phantom.stdout.on('data', function(chunk) { console.log(chunk); });
    phantom.stderr.on('data', function(chunk) { console.log(chunk); });
    phantom.on('exit', function(status) {
      console.log('phantomjs exited with code', status);
      process.exit(status);
    });
  });
}

if ('PHANTOMJS' in process.env)
  start();
else
  spawn('which', [PHANTOMJS]).on('exit', function(status) {
    if (status) {
      console.log('phantomjs not found. please install it from ' +
                  'http://phantomjs.org/, or set the ');
      console.log('PHANTOMJS environment variable to its absolute path.');
      process.exit(status);
    }
    start();
  });
