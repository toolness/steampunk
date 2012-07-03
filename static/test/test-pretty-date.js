defineTests(['util/pretty-date'], function(prettyDate) {
  describe('prettyDate()', function() {
    it('should return "in the future" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now+1, now)).to.be("in the future");
    });

    it('should return "just now" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now+1)).to.be("just now");
    });

    it('should return "1 minute ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60)).to.be("1 minute ago");
    });

    it('should return "2 minutes ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*2)).to.be("2 minutes ago");
    });

    it('should return "1 hour ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*60)).to.be("1 hour ago");
    });

    it('should return "2 hours ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*60*2)).to.be("2 hours ago");
    });

    it('should return "Yesterday" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*60*24)).to.be("Yesterday");
    });

    it('should return "7 days ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*60*24*7)).to.be("7 days ago");
    });

    it('should return "2 weeks ago" when appropriate', function() {
      var now = Date.now();
      expect(prettyDate(now, now + 1000*60*60*24*14)).to.be("2 weeks ago");
    });
  });
});
