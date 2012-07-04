define([
  "socket.io"
], function(io) {
  return {
    create: function() {
      return new io.EventEmitter();
    },
    mixInto: function(constructor) {
      io.util.mixin(constructor, io.EventEmitter);
    }
  };
});
