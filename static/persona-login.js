"use strict";

define([
  "jquery",
  "text!templates/persona-login.html",
], function($, loginHTML) {
  var INCLUDE_JS = "https://login.persona.org/include.js";
  var loginElement;
  var injected = false;

  // Modified from:
  // http://blog.typekit.com/2011/05/25/loading-typekit-fonts-asynchronously/
  function injectPersonaInclude(cb) {
    if (injected)
      return cb();
    var tk = document.createElement('script');
    tk.src = INCLUDE_JS;
    tk.type = 'text/javascript';
    tk.async = 'true';
    tk.onload = tk.onreadystatechange = function() {
      var rs = this.readyState;
      if (injected || rs && rs != 'complete' && rs != 'loaded') return;
      injected = true;
      cb();
    };
    document.body.appendChild(tk);
  };

  function removeLoginElement() {
    if (loginElement) {
      loginElement.remove();
      loginElement = null;
    }
  }
  
  return {
    show: function(options) {
      var logArea = options.logArea;
      var success = options.success;
      
      injectPersonaInclude(function() {
        removeLoginElement();

        navigator.id.watch({
          onlogin: function(assertion) {
            var req = $.ajax({
              type: 'POST',
              url: '/verify',
              data: {assertion: assertion},
              dataType: 'json',
              success: function(info) {
                // Don't cache the persona login credentials, in case
                // the user wants to logout and log in with a different
                // user account.
                navigator.id.logout();
                
                if (info.status == "ok") {
                  success(info.credentials);
                  removeLoginElement();
                } else {
                  logArea.log("error", "Login error: " +
                              info.status + " (" + info.message + ")");
                }
              },
              error: function() {
                logArea.log('An error occurred. Please try again.');
              }
            });
          },
          onlogout: function() {}
        });
        
        loginElement = $(loginHTML);
        logArea.logElement(loginElement);
        loginElement.click(function() {
          navigator.id.request();
          return false;
        });
      });
    }
  };
});
