var https = require('https'),
    querystring = require('querystring');

// Taken from:
// https://raw.github.com/toolness/browserid-cors/master/lib/browserid.js
exports.verify = function(audience, assertion, cb) {
  var body = querystring.stringify({
    audience: audience,
    assertion: assertion
  });

  var verifyReq = https.request({
    host: 'verifier.login.persona.org',
    port: 443,
    path: '/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.length.toString()
    }
  }, function(verifyRes) {
    var chunks = [];
    if (verifyRes.statusCode == 200) {
      verifyRes.setEncoding('utf8');
      verifyRes.on('data', function(chunk) { chunks.push(chunk); });
      verifyRes.on('end', function() {
        var result = JSON.parse(chunks.join(''));
        if (result.status == "okay")
          cb(null, result.email);
        else
          cb('bad assertion');
      });
    } else {
      cb('bad response from verifier');
    }
  });

  verifyReq.on('error', function() {
    cb('could not reach verify server');
  });
  verifyReq.write(body);
  verifyReq.end();
};

exports.getLoginFromEmail = function(users, email) {
  for (var username in users) {
    var user = users[username];
    if (!user.emails)
      return null;
    var index = user.emails.indexOf(email);
    if (index != -1)
      return {
        username: username,
        password: user.password
      };
  }
  return null;
};

exports.LoginFromAssertionEndpoint = function(config, persona) {
  persona = persona || exports;

  if (!config.audience)
    throw new Error('config.audience expected');

  if (!config.users)
    throw new Error('config.users expected');
    
  return function(req, res) {
    if (!(req.body && req.body.assertion))
      return res.send(400);

    persona.verify(config.audience, req.body.assertion, function(err, email) {
      if (err)
        return res.send({
          status: "persona-failure",
          message: err
        });
      var credentials = persona.getLoginFromEmail(config.users, email);
      if (credentials)
        return res.send({
          status: "ok",
          credentials: credentials
        });
      return res.send({
        status: "no-account",
        message: "no account for email " + email + " exists"
      });
    });
  }
};
