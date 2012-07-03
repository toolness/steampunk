defineTests(["util/linkify"], function(linkifyTextToHTML) {
  describe('linkifyTextToHTML', function() {
    it('should wrap solitary URLs in anchor tags', function() {
      expect(linkifyTextToHTML('http://foo.com'))
        .to.be('<a href="http://foo.com">http://foo.com</a>');
    });

    it('should wrap URLs in beginning of text in anchor tags', function() {
      expect(linkifyTextToHTML('hi http://foo.com'))
        .to.be('hi <a href="http://foo.com">http://foo.com</a>');
    });

    it('should wrap URLs in end of text in anchor tags', function() {
      expect(linkifyTextToHTML('http://foo.com, dawg.'))
        .to.be('<a href="http://foo.com">http://foo.com</a>, dawg.');
    });

    it('should wrap URLs in middle of text in anchor tags', function() {
      expect(linkifyTextToHTML('it is http://foo.com.'))
        .to.be('it is <a href="http://foo.com">http://foo.com</a>.');
    });

    it('should wrap multiple URLs in anchor tags', function() {
      expect(linkifyTextToHTML('they are http://foo.com and http://bar.com.'))
        .to.be('they are <a href="http://foo.com">http://foo.com</a> and ' +
               '<a href="http://bar.com">http://bar.com</a>.');
    });

    it('should wrap https URLs in anchor tags', function() {
      expect(linkifyTextToHTML('https://foo.com'))
        .to.be('<a href="https://foo.com">https://foo.com</a>');
    });

    it('should not wrap javascript: URLs', function() {
      expect(linkifyTextToHTML('javascript:alert("NO U")'))
        .to.be('javascript:alert("NO U")');
    });

    it('should accept a callback that modifies the anchor', function() {
      expect(linkifyTextToHTML('http://foo.com', function(a) {
        a.setAttribute("href", "http://different.com");
      })).to.be('<a href="http://different.com">http://foo.com</a>');
    });
  });
});
