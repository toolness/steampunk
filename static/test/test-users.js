describe('Users.removeAll()', function() {
  it('should work', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["jim", "jane"], "#b");
    users.removeAll();
    expect(users.getAllChannels()).to.have.length(0);
    expect(Object.keys(users.nicks)).to.have.length(0);
  });
});

describe('Users.getAllChannels()', function() {
  it('should work', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["jim", "jane"], "#b");
    expect(users.getAllChannels().sort()).to.eql(["#a", "#b"]);
  });
});

describe('Users.rename()', function() {
  it('should work', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    var bob = users.get("bob");
    users.rename("bob", "bob-away");
    expect(users.get("bob-away")).to.be(bob);
    expect(users.get("bob")).to.be(null);
  });

  it('should not throw if nick does not exist', function() {
    var users = new Users();
    users.rename("flop", "goof");
  });
});

describe('Users.add()', function() {
  it('should append to channel list', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#b");    
    expect(users.get("bob").channels).to.eql(["#a", "#b"]);
  });

  it('should not include duplicate channels', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#a");
    expect(users.get("bob").channels).to.eql(["#a"]);
  });
});

describe('Users.remove()', function() {
  it('should remove entire user when no channel is specified', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#b");
    users.remove(["bob"]);
    expect(users.get("bob")).to.be(null);
  });

  it('should remove channel when one is specified', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#b");
    users.remove(["bob"], "#a");
    expect(users.get("bob").channels).to.eql(["#b"]);
  });

  it('should remove user when their last channel is removed', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#b");
    users.remove(["bob"], "#a");
    users.remove(["bob"], "#b");
    expect(users.get("bob")).to.be(null);
  });

  it('should not throw when a bad nick is passed', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.remove(["flog"]);
  });
  
  it('should not throw when a bad channel is passed', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.remove(["bob"], "#b");
    expect(users.get("bob").channels).to.eql(["#a"]);
  });

  it('should not throw when a bad nick and channel are passed', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.remove(["flog"], "#b");
    expect(users.get("bob").channels).to.eql(["#a"]);
  });

});

describe('Users.removeChannel()', function() {
  it('should remove a channel from all users', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.add(["bob", "jane"], "#b");
    users.removeChannel("#a");
    expect(users.get("bob").channels).to.eql(["#b"]);
    expect(users.get("jane").channels).to.eql(["#b"]);
  });

  it('should remove users who no longer have any channels', function() {
    var users = new Users();
    users.add(["bob", "jane"], "#a");
    users.removeChannel("#a");
    expect(users.get("bob")).to.be(null);
    expect(users.get("jane")).to.be(null);
  });
});
