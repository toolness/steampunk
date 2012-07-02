"use strict";

define(function() {
  return function Login(key) {
    key = key || "steampunk_irc_login_info";

    return {
      set: function(username, password) {
        try {
          localStorage[key] = JSON.stringify({
            username: username,
            password: password
          });
        } catch (e) {}
      },
      get: function() {
        try {
          return JSON.parse(localStorage[key]);
        } catch (e) {
          return null;
        }
      },
      clear: function() {
        delete localStorage[key];
      }
    };
  };
});
