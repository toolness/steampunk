var express = require('express'),
    irc = require('irc'),
    data = require('./data.js'),
    config = require('./config.js'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    ircClients = {},
    userChannels = data.load('channels');

const AWAY_SUFFIX = '-away';

Object.keys(config.users).forEach(function(username) {
  var user = config.users[username];
  user.awayNick = user.nick + AWAY_SUFFIX;
  ircClients[username] = new irc.Client(config.irc.server, user.awayNick, {
    realName: user.realName,
    channels: userChannels.get(username, []),
    debug: true
  });
});

app.use(express.static(__dirname + '/static'));

function onUserLogin(socket, username) {
  var ircClient = ircClients[username],
      userConfig = config.users[username];
  
  var ircEventListeners = {
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
    part: function (channel, nick, reason) {
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
  };

  Object.keys(ircEventListeners).forEach(function(event) {
    ircClient.addListener(event, ircEventListeners[event]);
  });

  ircClient.send("NICK", userConfig.nick);
  socket.emit('configuration', {
    channels: Object.keys(ircClient.chans)
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
    ircClient.say(data.target, data.message);
  });
  socket.on('topic', function(data) {
    ircClient.send("TOPIC", data.channel);
  });
  socket.on('disconnect', function(data) {
    Object.keys(ircEventListeners).forEach(function(event) {
      ircClient.removeListener(event, ircEventListeners[event]);
    });
    ircClient.send("NICK", userConfig.awayNick);
  });
}

io.sockets.on('connection', function(socket) {
  socket.on('login', function(data) {
    if (!(data.username in config.users &&
          data.password == config.users[data.username].password)) {
      socket.emit('go-away', {});
      socket.disconnect();
      return;
    }
    
    onUserLogin(socket, data.username);
  });
});

module.exports = app;

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function() {
  console.log("Farewell.");
});

if (!module.parent) {
  console.log("listening on port 3000");
  app.listen(3000);
}
