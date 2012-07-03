"use strict";

define([
  "users",
  "event-emitter",
  "socket.io"
], function(Users, EventEmitter, io) {
  var DELEGATED_EVENTS = [
    'whois',
    'message',
    'irc-error',
    'disconnect',
    'go-away',
    'topic',
    'custom-global-metadata',
    'change-custom-global-metadata',
    'pong',
    'connect',
    'join',
    'part',
    'quit',
    'kick',
    'kill',
    'names',
    'nick'
  ];
  
  function IRC() {
    this.socket = null;
    this.nick = "UNKNOWN";
    this.timeDelta = 0;
    this.users = new Users();
  }
  
  IRC.prototype = {
    logout: function() {
      this.socket.disconnect();
      this.socket = null;
    },
    login: function(username, password) {
      var self = this;
      this.socket = io.connect(undefined, {
        'force new connection': true
      });
      self.socket.on('connect', function() {
        self.socket.emit('login', {
          username: username,
          password: password
        });
      });
      self.socket.on('configuration', function(config) {
        self.nick = config.nick;
        self.timeDelta = Date.now() - config.now;
        config.channels.forEach(function(channel) {
          self.users.add(self.nick, channel);
        });
        self.emit('login');
      });
      self.socket.on('join', function(info) {
        self.users.add(info.nick, info.channel);
      });
      self.socket.on('part', function(info) {
        self.users.remove(info.nick, info.channel);
      });
      self.socket.on('quit', function(info) {
        self.users.remove(info.nick);
      });
      self.socket.on('kick', function(info) {
        self.users.remove(info.nick, info.channel);
      });
      self.socket.on('kill', function(info) {
        self.users.remove(info.nick);
      });
      self.socket.on('names', function(info) {
        var nicks = Object.keys(info.nicks);
        self.users.add(nicks, info.channel);
      });
      self.socket.on('nick', function(info) {
        if (info.oldnick == self.nick)
          self.nick = info.newnick;
        self.users.rename(info.oldnick, info.newnick);
      });
      self.socket.on('disconnect', function() {
        self.nick = "UNKNOWN";
        self.users.removeAll();
      });
      
      DELEGATED_EVENTS.forEach(function(event) {
        self.socket.on(event, function() {
          var args = [event];
          for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);
          console.log('SOCKET MESSAGE', event, args.slice(1));
          self.emit.apply(self, args);
        });
      });
    },
    say: function(target, message) {
      this.socket.emit('say', {target: target, message: message});
    },
    join: function(channel) {
      this.socket.emit('join', {channel: channel});
    },
    part: function(channel) {
      this.users.removeChannel(channel);
      this.socket.emit('part', {channel: channel});
    },
    whois: function(nick) {
      this.socket.emit('whois', {nick: nick});
    },
    getNames: function(channel) {
      this.socket.emit('names', {channel: channel});
    },
    setCustomGlobalMetadata: function(key, value) {
      this.socket.emit('set-custom-global-metadata',
                       {key: key, value: value});
    },
    getCustomGlobalMetadata: function() {
      this.socket.emit('get-custom-global-metadata');
    },
    getLoggedMessages: function(start, end, cb) {
      var self = this;

      function onLoggedMessages(data) {
        if (data.start == (start || 0) && data.end == end) {
          self.socket.removeListener('logged-messages', onLoggedMessages);
          cb(data.messages);
        }
      }

      this.socket.emit('get-logged-messages', {start: start, end: end});
      self.socket.addListener('logged-messages', onLoggedMessages);
    }
  };
  
  EventEmitter.mixInto(IRC);
  
  return IRC;
});
