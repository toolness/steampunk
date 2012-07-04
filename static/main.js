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
  "twitter"
], function($, _, LogArea, IRC, UserListView, CommandLine, Login,
            prettyDate, misc, twitter) {
  function showLoggedMessages(irc, logArea) {
    var CHUNK_SIZE = 10;
    var lastChunk = -CHUNK_SIZE;

    function logOldMessage(msg, options) {
      logArea.logSocialMessage(_.extend({
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
            messages.forEach(function(msg) {
              logOldMessage(msg, {where: oldMessages});
            });
            if (messages.length == 0)
              fetchMore.fadeOut();
          });
          lastChunk = newLastChunk;
          oldMessages.insertAfter(fetchMore).hide().fadeIn();
        });
        logArea.logElement(fetchMore);
      }
      messages.forEach(function(msg) {
        logOldMessage(msg, {forceScroll: true});
      });
    });
  }
  
  function start() {
    var login = new Login();
    var loginInfo = login.get();
    var irc = new IRC();
    var userListView = new UserListView(irc.users, $("#users"));
    var twitterUsers = new twitter.TwitterUsers(irc);
    var logArea = new LogArea({
      element: $("#messages"),
      twitterUsers: twitterUsers
    });
    var log = logArea.log;
    var twitterViewMixIn = new twitter.TwitterViewMixIn(userListView,
                                                        twitterUsers);
    var cmdLine = new CommandLine($("#cmd"), irc, logArea, login,
                                  twitterUsers);
    var isUnloading = false;

    if (loginInfo) {
      cmdLine.execute("/login " + loginInfo.username + " " + 
                      loginInfo.password);
    } else
      log("Please use the /login command to log in.");

    cmdLine.el.focus();
    irc.on('connect', function() { log("Connected. Logging in..."); });
    irc.on('login', function() {
      var channels = irc.users.getAllChannels();
      log("info", "Your nick is " + irc.nick +
          ". You are in channels: " + channels.join(", ") + ".");
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
    irc.on('go-away', function() {
      log("error", "The server does not seem to like you. Consider trying " +
          "a different username or password.");
    });
    irc.on('irc-error', function(info) {
      log("error", "Alas, an IRC error occurred: " + info.command);
    });
    irc.on('disconnect', function() {
      if (!isUnloading)
        log("error", "The connection to the server has been lost.");
    });
    $(window).on('beforeunload', function() { isUnloading = true; });
    $(window).on('click', 'span.nick, span.target', function(evt) {
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
  
  return start();
});
