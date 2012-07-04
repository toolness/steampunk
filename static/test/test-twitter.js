defineTests(["event-emitter", "twitter"], function(EventEmitter, twitter) {
  describe("TwitterUsers", function() {
    it("should update from IRC load of custom global data", function() {
      var irc = EventEmitter.create();
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
      var irc = EventEmitter.create();
      var mappings = {};
      irc.setCustomGlobalMetadata = function(key, value) {
        mappings[key] = value;
      };
      var tu = new twitter.TwitterUsers(irc);
      tu.set("atul", "toolness");
      expect(tu.getAvatarElement('atul|otp')).to.have.length(1);
      expect(mappings).to.eql({
        'twitter-mapping/atul': 'toolness'
      });
    });
  });
});
