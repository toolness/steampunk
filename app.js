var express = require('express'),
    irc = require('irc'),
    persona = require('./persona'),
    storage = require('./storage.js').configure({
      rootDir: process.env['STORAGE_ROOT_DIR'] || __dirname + '/storage-data'
    }),
    config = storage.loadSync('config').get(),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    ircClients = {},
    userSockets = {},
    userMessageLogs = {},
    userLogoutTimeouts = {},
    userChannels = storage.loadSync('channels'),
    customGlobalMetadata = storage.loadSync('custom-global-metadata');

const AWAY_SUFFIX = '-away',
      MESSAGE_LOG_SAVE_DELAY = 3000,
      USER_LOGOUT_TIMEOUT = 4000;

if (Object.keys(config).length == 0) {
  console.log('Please copy config.sample.json to storage-data/config.json ' +
              'and edit it. See README.md for more details.');
  process.exit(1);
}
if (config.config) config = config.config; // support older schema

config.audience = process.env['PERSONA_AUDIENCE'] || config.audience;

if (!config.audience) {
  console.log('Please set the PERSONA_AUDIENCE environment variable ' +
              'or define config.audience. See README.md for more details.');
  process.exit(1);
}

Object.keys(config.users).forEach(function(username) {
  var user = config.users[username];
  user.awayNick = user.nick + AWAY_SUFFIX;
  userMessageLogs[username] = storage.loadSync('message-log-' + username, {
    flushDelay: MESSAGE_LOG_SAVE_DELAY
  });
  ircClients[username] = new irc.Client(config.irc.server, user.awayNick, {
    realName: user.realName,
    channels: userChannels.get(username, []),
    debug: true
  });
  ircClients[username].on('selfMessage', function(to, text) {
    userMessageLogs[username].appendToList("entries", {
      item: {
        nick: user.nick,
        to: to,
        text: text,
        timestamp: Date.now()
      },
      maxLength: config.irc.messageLogEntries
    });
  });
  ircClients[username].on('message', function(nick, to, text) {
    userMessageLogs[username].appendToList("entries", {
      item: {
        nick: nick,
        to: to,
        text: text,
        timestamp: Date.now()
      },
      maxLength: config.irc.messageLogEntries
    });
  });
});

app.use(express.static(__dirname + '/static'));

app.post('/verify', express.bodyParser(),
         persona.LoginFromAssertionEndpoint(config));

function onUserLogin(socket, username) {
  var ircClient = ircClients[username],
      userConfig = config.users[username];
  
  var ircEventListeners = {
    error: function(message) {
      socket.emit('irc-error', message);
    },
    raw: function(message) {
      console.log("RAW", message);
    },
    names: function(channel, nicks) {
      socket.emit('names', {
        channel: channel,
        nicks: nicks
      });
    },
    topic: function(channel, topic, nick) {
      socket.emit('topic', {
        channel: channel,
        topic: topic,
        nick: nick
      });
    },
    nick: function(oldnick, newnick, channels) {
      socket.emit('nick', {
        oldnick: oldnick,
        newnick: newnick,
        channels: channels
      });
    },
    join: function(channel, nick) {
      if (nick == userConfig.nick)
        userChannels.addToSet(username, channel);

      socket.emit('join', {
        channel: channel,
        nick: nick
      });
    },
    quit: function(nick, reason, channels) {
      socket.emit('quit', {
        nick: nick,
        reason: reason,
        channels: channels
      });
    },
    kick: function(channel, nick, by, reason) {
      socket.emit('kick', {
        channel: channel,
        nick: nick,
        by: by,
        reason: reason
      });
    },
    kill: function(nick, reason, channels) {
      socket.emit('kill', {
        nick: nick,
        reason: reason,
        channels: channels
      });
    },
    part: function(channel, nick, reason) {
      if (nick == userConfig.nick)
        userChannels.removeFromSet(username, channel);

      socket.emit('part', {
        channel: channel,
        nick: nick,
        reason: reason
      });
    },
    message: function(nick, to, text) {
      socket.emit('message', {
        nick: nick,
        to: to,
        text: text
      });
    },
    whois: function(info) {
      socket.emit('whois', info);
    },
    registered: function(message) {
      if (message.args[0] != userConfig.nick)
        ircClient.send("NICK", userConfig.nick);
    }
  };

  Object.keys(ircEventListeners).forEach(function(event) {
    ircClient.addListener(event, ircEventListeners[event]);
  });

  clearTimeout(userLogoutTimeouts[username]);
  delete userLogoutTimeouts[username];
  
  if (ircClient.nick != userConfig.nick)
    ircClient.send("NICK", userConfig.nick);
  socket.emit('configuration', {
    channels: Object.keys(ircClient.chans),
    nick: ircClient.nick,
    now: Date.now()
  });
  socket.on('join', function(data) {
    ircClient.join(data.channel);
  });
  socket.on('part', function(data) {
    ircClient.part(data.channel);
  });
  socket.on('names', function(data) {
    ircClient.send("NAMES", data.channel);
  });
  socket.on('say', function(data) {
    console.log("SAY", data);
    ircClient.say(data.target, data.message);
  });
  socket.on('ping', function() {
    socket.emit('pong');
  });
  socket.on('whois', function(data) {
    ircClient.whois(data.nick);
  });
  socket.on('topic', function(data) {
    ircClient.send("TOPIC", data.channel);
  });
  socket.on('set-custom-global-metadata', function(data) {
    customGlobalMetadata.set(data.key, data.value || undefined);
    socket.broadcast.emit('change-custom-global-metadata', data);
  });
  socket.on('get-custom-global-metadata', function() {
    var metadata = customGlobalMetadata.get();
    socket.emit('custom-global-metadata', metadata);
  });
  socket.on('get-logged-messages', function(data) {
    var start = data.start || 0,
        end = data.end,
        messages = userMessageLogs[username].get("entries", [])
          .slice(start, end);

    socket.emit('logged-messages', {
      start: start,
      end: end,
      messages: messages
    });
  });
  socket.on('disconnect', function(data) {
    Object.keys(ircEventListeners).forEach(function(event) {
      ircClient.removeListener(event, ircEventListeners[event]);
    });
    userLogoutTimeouts[username] = setTimeout(function() {
      ircClient.send("NICK", userConfig.awayNick);
    }, USER_LOGOUT_TIMEOUT);
  });
}

io.sockets.on('connection', function(socket) {
  socket.on('login', function(data) {
    var otherSocket = userSockets[data.username];
    var startSession = function() {
      if (socket.disconnected) return;
      if (userSockets[data.username])
        throw new Error("Assertion failure, userSockets entry exists");
      userSockets[data.username] = socket;
      socket.on('disconnect', function() {
        delete userSockets[data.username];
      });
      onUserLogin(socket, data.username);
    };

    if (!(data.username in config.users &&
          data.password == config.users[data.username].password)) {
      socket.emit('go-away', {reason: 'invalid-credentials'});
      socket.disconnect();
      return;
    }
    
    if (otherSocket) {
      otherSocket.on('disconnect', startSession);
      otherSocket.emit('go-away', {reason: 'login-from-elsewhere'});
      otherSocket.disconnect();
    } else
      startSession();
  });
});

module.exports = app;

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function() {
  console.log("Farewell.");
});

process.on('uncaughtException', function(err) {
  console.error("UNCAUGHT EXCEPTION", err);
});

if (!module.parent) {
  var port = process.env['PORT'] || 3000;
  app.listen(port, function() {
    console.log("listening on port " + port);
  });
}
