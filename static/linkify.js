// Take untrusted text and return a string of safe HTML with all URLs
// wrapped in anchor tags.
//
// This should be secure because we're never manually escaping anything
// ourselves; instead, we always use safe DOM methods to do that work
// for us.
var linkifyTextToHTML = (function() {
  // This regex is slightly modified from:
  // http://www.codinghorror.com/blog/2008/10/the-problem-with-urls.html
  var RE = /\(?\bhttps?:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|]/;
  
  return function(text, anchorCallback) {
    function addText(parent, text) {
      if (text)
        parent.appendChild(document.createTextNode(text));
    }
    
    var docFrag = document.createElement('span');
    
    while (text) {
      var a = RE.exec(text);
      if (!a)
        break;
      var url = text.slice(a.index, a.index + a[0].length);
      var anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      addText(anchor, url);

      if (anchorCallback)
        anchorCallback(anchor);

      addText(docFrag, text.slice(0, a.index));
      docFrag.appendChild(anchor);
      text = text.slice(a.index + a[0].length);
    }
    if (text)
      addText(docFrag, text);
    return docFrag.innerHTML;
  };
})();
