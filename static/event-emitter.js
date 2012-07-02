define([
  "socket.io"
], function(io) {
  return {
    mixInto: function(constructor) {
      io.util.mixin(constructor, io.EventEmitter);
    }
  };
});
