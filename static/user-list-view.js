"use strict";

define([
  "jquery"
], function($) {
  function insertAlphabetically(el, user, nick) {
    nick = nick.toLowerCase();
    var users = el.find(".user");
    for (var i = 0; i < users.length; i++) {
      var otherNick = $(users[i]).find(".nick").text().toLowerCase();
      if (nick < otherNick) {
        user.insertBefore(users[i]);
        return;
      }
    }
    el.append(user);
  }
  
  return function(users, el) {
    var nicks = {};
    users.on('add', function(nick) {
      var user = $('<div class="user"></div>');
      $('<span class="nick"></span>').text(nick).appendTo(user);
      insertAlphabetically(el, user, nick);
      nicks[nick] = user;
    });
    users.on('rename', function(oldnick, newnick) {
      var user = nicks[oldnick];
      delete nicks[oldnick];
      nicks[newnick] = user;
      user.find(".nick").text(newnick);
      insertAlphabetically(el, user.remove(), newnick);
    });
    users.on('remove', function(nick) {
      nicks[nick].remove();
      delete nicks[nick];
    });
    return {
      users: users,
      el: el,
      getElementForNick: function(nick) {
        return nicks[nick];
      }
    };
  };
});
