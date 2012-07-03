define(function() {
  return {
    doesNickMatch: function(base, actual) {
      var match = actual.match(/^[_]*([A-Za-z0-9]+)/);
      if (!match)
        return false;
      if (match[1] == base || match[1] == base + '1')
        return true;
      return false;
    }
  };
});
