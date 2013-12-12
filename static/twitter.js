"use strict";

define([
  "jquery",
  "util/misc",
  "event-emitter"
], function($, misc, EventEmitter) {
  var AVATAR_IMG = 'http://twitter.com/api/users/profile_image/';
  var PROFILE_URL = 'http://twitter.com/';

  function TwitterUsers(irc) {
    var self = this;

    this.users = {};
    this.irc = irc;

    irc.on('custom-global-metadata', function(data) {
      data = data || {};
      Object.keys(data).forEach(function(key) {
        if (key.indexOf(self.PREFIX) == 0) {
          var nick = key.slice(self.PREFIX.length);
          self.users[nick] = data[key];
        }
      });
      self.emit('change');
    });
  }
  
  TwitterUsers.prototype = {
    PREFIX: 'twitter-mapping/',
    set: function(nick, twitterUser) {
      if (twitterUser)
        this.users[nick] = twitterUser;
      else
        delete this.users[nick];
      this.irc.setCustomGlobalMetadata(this.PREFIX + nick, twitterUser);
      this.emit('change');
    },
    getAvatarElement: function(nick) {
      for (var baseNick in this.users) {
        if (misc.doesNickMatch(baseNick, nick)) {
          var twitterName = this.users[baseNick];
          
          if (!twitterName)
            return null;
          
          var a = $('<a class="twitter-user" target="_blank"></a>')
            .attr('href', PROFILE_URL + twitterName)
            .attr('title', nick + ' is @' + twitterName + ' on Twitter.');
          var img = $('<img>')
            .attr('src', AVATAR_IMG + twitterName)
            .appendTo(a);
          return a;
        }
      }
      return null;
    }
  };
  
  EventEmitter.mixInto(TwitterUsers);
  
  return {
    TwitterUsers: TwitterUsers,
    TwitterViewMixIn: function(userListView, twitterUsers) {
      function insertTwitterInfo(nick) {
        var a = twitterUsers.getAvatarElement(nick);
        if (a)
          userListView.getElementForNick(nick).prepend(a);
      }
      
      userListView.users.on('add', insertTwitterInfo);
      userListView.users.on('rename', function(oldnick, newnick) {
        userListView.getElementForNick(newnick)
          .find(".twitter-user").remove();
        insertTwitterInfo(newnick);
      });
      twitterUsers.on('change', function() {
        userListView.el.find(".twitter-user").remove();
        userListView.users.getAllNicks().forEach(insertTwitterInfo);
      });

      return {
        userListView: userListView,
        twitterUsers: twitterUsers
      };
    }
  };
});
