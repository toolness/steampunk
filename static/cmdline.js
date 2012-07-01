var CommandLine = (function() {
  return function(cmd, irc, logArea) {
    var log = logArea.log;
    var commands = {
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
        if (input[0] == '/')
          handleCommand(input);
        else if (input[0] == '@' || input[0] == '#')
          handleSay(input);
        else
          log("error", "Your input should start with /, #, or @.");
      }
    });    
  };
})();
