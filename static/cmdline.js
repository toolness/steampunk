"use strict";

define(["jquery", "underscore"], function($, _) {
  return function(cmd, irc, logArea, login, twitterUsers) {
    var log = logArea.log;
    var commands = {
      login: function(arg) {
        var parts = arg.split(" ");
        var username = parts[0];
        var password = parts[1];
        
        if (!username)
          return log("error", "Please provide a username and password.");
        if (!password)
          return log("error", "Please provide a password.");
        login.set(username, password);
        log("Connecting...");
        irc.login(username, password);
      },
      logout: function() {
        log("Logging you out. You may need to reload the page to login " +
            "again.");
        login.clear();
        irc.logout();
      },
      who: function(arg) {
        if (!arg)
          return log("error", "Please specify a channel to list names of, " +
                     "or a nick to get more information on.");
        if (arg[0] == '#') {
          log("Looking for people in " + arg + "...");
          irc.getNames(arg);
        } else
          irc.whois(arg);
      },
      join: function(arg) {
        if (!arg)
          return log("error", "Please specify a channel to join.");
        log("Attempting to join " + arg + "...");
        irc.join(arg);
      },
      leave: function(arg) {
        if (!arg)
          return log("error", "Please specify a channel to leave.");
        log("Attempting to leave " + arg + "...");
        irc.part(arg);
      },
      twittername: function(arg) {
        if (!arg)
          return log("error", "Please provide a nick and, optionally, " +
                     "its respective Twitter name.");
        var parts = arg.split(" ");
        var nick = parts[0].trim();
        var twitterName = (parts[1] || "").trim();

        if (!twitterName)
          log("Dissociating " + nick + " from any Twitter username.");
        else
          log("Associating " + nick + " with the Twitter username @" +
              twitterName + ".");
        
        twitterUsers.set(nick, twitterName);
      }
    };
    
    function splitAtSpace(input) {
      var firstSpace = input.indexOf(" ");
      var arg = "";
      var cmd = input;
      if (firstSpace != -1) {
        cmd = input.slice(0, firstSpace);
        arg = input.slice(firstSpace).trim();
      }
      return [cmd, arg];
    }

    function handleCommand(input) {
      var parts = splitAtSpace(input);
      var cmd = parts[0].slice(1);
      var arg = parts[1];

      if (cmd in commands)
        commands[cmd](arg);
      else
        log("error", "Sadly, I don't know that command. Please choose " +
            "from: /" + Object.keys(commands).join(", /") + ".");
    }

    function getChannelAutocompletions(to, channels) {
      return _.filter(channels, function(channel) {
        return (channel.indexOf(to) == 0);
      });
    }

    function handleSay(input) {
      var parts = splitAtSpace(input);
      var to = parts[0];
      var msg = parts[1];

      if (to[0] == '@') {
        to = to.slice(1);
        if (!to)
          return log("error", "Please specify a user after @.");
      } else {
        var channels = irc.users.getAllChannels();
        var matches = getChannelAutocompletions(to, channels);
        if (matches.length == 0)
          return log("error", "Unknown channel. Please choose from: " +
                     channels.join(", ") + ".");
        if (matches.length > 1)
          return log("error",
                     "I'm not sure whether you mean " + matches.join(" or ") +
                     ". Please be more specific.");
        to = matches[0];
      }

      if (!msg)
        return log("error",
                   "I understand that you want to talk to " + to + ", but " +
                   "I need a message.");
      irc.say(to, msg);
      logArea.logSocialMessage({
        target: to,
        className: "self-msg",
        nick: irc.nick,
        message: msg,
        forceScroll: true
      });
    }

    cmd.keyup(function(event) {
      if (event.keyCode == 13) {
        var input = $(this).val().trim();
        $(this).val('');
        if (!input)
          return;
        log('echo', input);
        self.execute(input);
      }
    });
    
    var self = {
      el: cmd,
      execute: function(input) {
        if (input[0] == '/')
          handleCommand(input);
        else if (input[0] == '@' || input[0] == '#')
          handleSay(input);
        else
          log("error", "Your input should start with /, #, or @.");
      }
    };
    
    return self;
  };
});
