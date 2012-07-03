defineTests(["util/misc"], function(misc) {
  var doesNickMatch = misc.doesNickMatch;
  
  describe("util/misc.doesNickMatch()", function() {
    it("should match joe to joe1", function() {
      expect(doesNickMatch("joe", "joe1")).to.be(true);
    });

    it("should match joe to joe_", function() {
      expect(doesNickMatch("joe", "joe_")).to.be(true);
    });

    it("should match joe to _joe", function() {
      expect(doesNickMatch("joe", "_joe")).to.be(true);
    });

    it("should match joe to joe-away", function() {
      expect(doesNickMatch("joe", "joe-away")).to.be(true);
    });

    it("should match j0e to j0e-away", function() {
      expect(doesNickMatch("j0e", "j0e-away")).to.be(true);
    });

    it("should NOT match joe to joedawg", function() {
      expect(doesNickMatch("joe", "joedawg")).to.be(false);
    });

    it("should NOT match joe to Joe", function() {
      expect(doesNickMatch("joe", "Joe")).to.be(false);
    });
  });
});
