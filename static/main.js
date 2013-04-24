"use strict";

define([
  "jquery",
  "underscore",
  "log-area",
  "irc",
  "user-list-view",
  "cmdline",
  "login",
  "util/pretty-date",
  "util/misc",
  "persona-login",
  "convert-links-to-thumbnails",
  "twitter"
], function($, _, LogArea, IRC, UserListView, CommandLine, Login,
            prettyDate, misc, PersonaLogin, convertLinksToThumbnails,
            twitter) {
  function showLoggedMessages(irc, logArea) {
    var CHUNK_SIZE = 10;
    var lastChunk = -CHUNK_SIZE;

    function logOldMessage(msg, options) {
      return logArea.logSocialMessage(_.extend({
        target: msg.to,
        className: "old-msg",
        nick: msg.nick,
        message: msg.text,
        timestamp: msg.timestamp + irc.timeDelta,
      }, options));
    }

    irc.getLoggedMessages(lastChunk, undefined, function(messages) {
      if (messages.length) {
        var fetchMore = $('<button class="fetch-more">Click here to see ' +
                          + CHUNK_SIZE + ' more archived messages.</button>');
        fetchMore.click(function() {
          if ($(this).hasClass("loading"))
            return;
          $(this).addClass("loading");
          var oldMessages = $('<div class="old-messages"></div>');
          var newLastChunk = lastChunk - CHUNK_SIZE;
          irc.getLoggedMessages(newLastChunk, lastChunk, function(messages) {
            fetchMore.removeClass("loading");
            for (var i = 0; i < messages.length; i++)
              logOldMessage(messages[i], {where: oldMessages});
            if (messages.length == 0)
              fetchMore.fadeOut();
          });
          lastChunk = newLastChunk;
          oldMessages.insertAfter(fetchMore).hide().fadeIn();
        });
        logArea.logElement(fetchMore);

        for (var i = 0; i < messages.length; i++)
          logOldMessage(messages[i], {forceScroll: true});
      }
    });
  }
  
  function start(options) {
    var root = options.root || window;
    var login = options.login || new Login();
    var personaLogin = options.personaLogin || PersonaLogin;
    var loginInfo = login.get();
    var irc = options.irc || new IRC();
    var userListView = new UserListView(irc.users, $(options.users));
    var twitterUsers = new twitter.TwitterUsers(irc);
    var logArea = new LogArea({
      element: $(options.messages),
      twitterUsers: twitterUsers
    });
    var log = logArea.log;
    var twitterViewMixIn = new twitter.TwitterViewMixIn(userListView,
                                                        twitterUsers);
    var cmdLine = new CommandLine($(options.commandLine), irc, logArea,
                                  login, twitterUsers);
    var isUnloading = false;

    if (loginInfo) {
      cmdLine.execute("/login " + loginInfo.username + " " + 
                      loginInfo.password);
    } else {
      personaLogin.show({
        logArea: logArea,
        success: function(loginInfo) {
          cmdLine.execute("/login " + loginInfo.username + " " + 
                          loginInfo.password);
        }
      });
    }

    convertLinksToThumbnails(logArea);
    cmdLine.el.focus();
    $(window).keydown(function(event) {
      if (!event.ctrlKey && !event.metaKey && !cmdLine.el.is(event.target))
        cmdLine.el.focus();
    });
    irc.on('connect', function() { log("Connected. Logging in..."); });
    irc.on('login', function() {
      var channels = irc.users.getAllChannels();
      log("info", "Your nick is " + irc.nick + ".");
      if (channels.length)
        log("info", "You are in channels: " + channels.join(", ") + ".");
      else
        log("info", "You're not in any channels. Join some with the /join " +
                    "command!");
      channels.forEach(function(channel) { irc.getNames(channel); });
      irc.getCustomGlobalMetadata();
      showLoggedMessages(irc, logArea);
    });
    irc.on('join', function(info) {
      log("info", info.nick + " has joined " + info.channel + ".");
    });
    irc.on('part', function(info) {
      log("info", info.nick + " has left " + info.channel + ".");
    });
    irc.on('whois', function(info) {
      if (!info)
        return log("error", "No information is available on that user.");
      var msg = info.nick + " is " + info.realname + ".";
      if (info.channels)
        msg += " They are in the following channels: " +
               info.channels.join(", ") + "."
      if (info.idle)
        msg += " They were last active " +
               prettyDate(Date.now() - info.idle * 1000) + ".";
      log(msg);
    });
    irc.on('quit', function(info) {
      log("info", info.nick + " has left the building.");
    });
    irc.on('kick', function(info) {
      log("info", info.nick + " has been kicked from " + info.channel + ".");
    });
    irc.on('kill', function(info) {
      log("info", info.nick + " has been killed from the server.");
    });
    irc.on('names', function(info) {
      var nicks = Object.keys(info.nicks);
      log("info", "Inside " + info.channel + " are: " +
          nicks.join(", ") + ".");
    });
    irc.on('nick', function(info) {
      log(info.oldnick + " is now known as " + info.newnick + ".");
    });
    irc.on('message', function(msg) {
      logArea.logSocialMessage({
        target: msg.to,
        nick: msg.nick,
        message: msg.text
      });
    });
    irc.on('go-away', function(info) {
      var reasons = {
        'invalid-credentials': 'Invalid credentials.',
        'login-from-elsewhere': 'Login detected from another client.'
      };
      var msg = reasons[info.reason];

      log("error", msg);
      if (info.reason == 'invalid-credentials')
        login.clear();
      irc.logout();
    });
    irc.on('irc-error', function(info) {
      log("error", "Alas, an IRC error occurred: " + info.command);
    });
    irc.on('disconnect', function() {
      if (!isUnloading)
        log("error", "The connection to the server has been lost.");
    });
    $(root).on('beforeunload', function() { isUnloading = true; });
    $(root).on('click', 'span.nick, span.target', function(evt) {
      misc.insertTextIntoField($(this).text(), cmdLine.el);
      return false;
    });
    
    return {
      login: login,
      logArea: logArea,
      irc: irc,
      userListView: userListView,
      cmdLine: cmdLine
    };
  }
  
  return start;
});
