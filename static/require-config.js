var require = {
  map: {
    '*': {
      'jquery': 'jquery.min',
      'underscore': 'underscore.min',
      'scrollto.jquery': 'scrollto.jquery.min',
      'socket.io': 'socket.io/socket.io'
    }
  },
  shim: {
    'scrollto.jquery.min': {
      deps: ['jquery'],
      exports: 'jQuery.fn.scrollTo'
    },
    'socket.io/socket.io': {
      exports: 'io'
    },
    'underscore.min': {
      exports: function() {
        return _.noConflict();
      }
    },
    'jquery.min': {
      exports: function() {
        jQuery.noConflict();
        return jQuery;
      }
    }
  }
};
