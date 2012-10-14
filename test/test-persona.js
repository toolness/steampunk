var expect = require('expect.js'),
    persona = require('../persona');

describe('persona.LoginFromAssertionEndpoint', function() {
  var res = {
    content: null,
    send: function(obj) {
      this.content = obj;
    }
  };
  
  beforeEach(function() {
    res.content = null;
  });
  
  it('should return 400 when no assertion provided', function() {
    persona.LoginFromAssertionEndpoint({
      audience: 'blah',
      users: {}
    }, {})({body: {}}, res);

    expect(res.content).to.be(400);
  });
  
  it('should return persona-failure when verification fails', function() {
    persona.LoginFromAssertionEndpoint({
      audience: 'blah',
      users: {}
    }, {
      verify: function(audience, assertion, cb) {
        expect(assertion).to.be('meh');
        expect(audience).to.be('blah');
        cb("bad assertion");
      }
    })({body: {assertion: 'meh'}}, res);

    expect(res.content).to.eql({
      status: "persona-failure",
      message: "bad assertion"
    });
  });
  
  it('should return credentials when they exist for email', function() {
    persona.LoginFromAssertionEndpoint({
      audience: 'blah',
      users: {'foo@bar.org': 'fake credentials'}
    }, {
      verify: function(audience, assertion, cb) {
        cb(null, 'foo@bar.org');
      },
      getLoginFromEmail: function(users, email) {
        return users[email];
      }
    })({body: {assertion: 'meh'}}, res);

    expect(res.content).to.eql({
      status: "ok",
      credentials: "fake credentials"
    });
  });
  
  it('should return no-account when no acct maps to email', function() {
    persona.LoginFromAssertionEndpoint({
      audience: 'blah',
      users: {}
    }, {
      verify: function(audience, assertion, cb) {
        cb(null, 'foo@bar.org');
      },
      getLoginFromEmail: function(users, email) {
        return null;
      }
    })({body: {assertion: 'meh'}}, res);

    expect(res.content).to.eql({
      status: "no-account",
      message: "no account for email foo@bar.org exists"
    });
  });
});

describe('persona.getLoginFromEmail()', function() {
  it('should return credentials for users w/ emails', function() {
    expect(persona.getLoginFromEmail({
      "blarg": {
        "password": "pw",
        "emails": ["foo@bar.org"]
      }
    }, 'foo@bar.org')).to.eql({
      username: "blarg",
      password: "pw"
    });
  });
  
  it('should return null for users w/o "emails" key', function() {
    expect(persona.getLoginFromEmail({
      "blarg": {
        "password": "pw",
      }
    }, 'foo@bar.org')).to.be(null);
  });
  
  it('should return null when no users correspond to email', function() {
    expect(persona.getLoginFromEmail({
      "blarg": {
        "password": "pw",
        "emails": ["baz@bar.org"]
      }
    }, 'foo@bar.org')).to.be(null);
  });
});
