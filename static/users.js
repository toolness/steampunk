var Users = (function() {
  function Users() {
    this.nicks = {};
  }

  Users.prototype = {
    getAllChannels: function() {
      var self = this;
      var allChannels = [];
      Object.keys(this.nicks).forEach(function(nick) {
        self.nicks[nick].channels.forEach(function(channel) {
          if (allChannels.indexOf(channel) == -1)
            allChannels.push(channel);
        });
      });
      return allChannels;
    },
    add: function(nicks, channel) {
      var self = this;
      if (typeof(nicks) == "string")
        nicks = [nicks];
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
    removeChannel: function(channel) {
      this.remove(Object.keys(this.nicks), channel);
    },
    remove: function(nicks, channel) {
      var self = this;
      if (typeof(nicks) == "string")
        nicks = [nicks];
      nicks.forEach(function(nick) {
        if (!channel)
          delete self.nicks[nick];
        else {
          if (nick in self.nicks) {
            var user = self.nicks[nick];
            var index = user.channels.indexOf(channel);
            if (index != -1)
              user.channels.splice(index, 1);
            if (user.channels.length == 0)
              delete self.nicks[nick];
          }
        }
      });
    }
  };
  
  return Users;
})();
