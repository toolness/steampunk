defineTests([
  "jquery",
  "event-emitter",
  "twitter",
  "user-list-view",
  "users"
], function($, EventEmitter, twitter, UserListView, Users) {
  function FakeIRC() { this.mappings = {}; }
  
  FakeIRC.prototype = {
    setCustomGlobalMetadata: function(key, value) {
      this.mappings[key] = value;
    }
  };
  
  EventEmitter.mixInto(FakeIRC);
  
  describe("TwitterUsers", function() {
    it("should update from IRC load of custom global data", function() {
      var irc = new FakeIRC();
      var tu = new twitter.TwitterUsers(irc);
      irc.emit('custom-global-metadata', {
        'twitter-mapping/atul': 'toolness'
      });
      var avatar = tu.getAvatarElement('atul-away');
      expect(tu.PREFIX).to.be('twitter-mapping/');
      expect(avatar).to.have.length(1);
      expect(avatar.attr("href")).to.match(/twitter\.com/);
      expect(avatar.find("img").attr("src")).to.match(/twitter\.com/);
    });
    
    it("should update itself and the server from set()", function() {
      var irc = new FakeIRC();
      var tu = new twitter.TwitterUsers(irc);
      tu.set("atul", "toolness");
      expect(tu.getAvatarElement('atul|otp')).to.have.length(1);
      expect(irc.mappings).to.eql({
        'twitter-mapping/atul': 'toolness'
      });
    });
  });
  
  describe("TwitterViewMixIn", function() {
    function makeIt() {
      var irc = new FakeIRC();
      var tu = new twitter.TwitterUsers(irc);
      var ulv = new UserListView(new Users(), $('<div></div>'));
      return new twitter.TwitterViewMixIn(ulv, tu);
    }
    
    it("should update when TwitterUsers instance updates", function() {
      var t = makeIt();
      t.userListView.users.add("atul-away", "#a");
      expect(t.userListView.el.find('.twitter-user')).to.have.length(0);
      t.twitterUsers.set("atul", "toolness");
      expect(t.userListView.el.find('.twitter-user')).to.have.length(1);
    });

    it("should update when Users instance updates", function() {
      var t = makeIt();
      t.twitterUsers.set("atul", "toolness");
      expect(t.userListView.el.find('.twitter-user')).to.have.length(0);
      t.userListView.users.add("atul-away", "#a");
      expect(t.userListView.el.find('.twitter-user')).to.have.length(1);
    });
  });
});
