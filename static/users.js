var Users = (function() {
  function Users() {
    this.nicks = {};
  }

  Users.prototype = {
    add: function(nicks, channel) {
      var self = this;
      nicks.forEach(function(nick) {
        if (!(nick in self.nicks))
          self.nicks[nick] = {channels: []};
        if (self.nicks[nick].channels.indexOf(channel) == -1)
          self.nicks[nick].channels.push(channel);
      });
    },
    get: function(nick) {
      return this.nicks[nick] || null;
    },
    rename: function(oldnick, newnick) {
      if (oldnick in this.nicks) {
        this.nicks[newnick] = this.nicks[oldnick];
        delete this.nicks[oldnick];
      }
    },
    remove: function(nick, channel) {
      if (!channel)
        delete this.nicks[nick];
      else {
        if (nick in this.nicks) {
          var user = this.nicks[nick];
          var index = user.channels.indexOf(channel);
          if (index != -1)
            user.channels.splice(index, 1);
          if (user.channels.length == 0)
            delete this.nicks[nick];
        }
      }
    }
  };
  
  return Users;
})();
