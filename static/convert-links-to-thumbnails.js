"use strict";

define(["jquery"], function($) {
  return function(logArea) {
    logArea.messages.on("logarea-social-message-added", function(event) {
      $(event.target).find(".content .wrapper a").each(function() {
        var link = this;
        var img = document.createElement("img");
        img.setAttribute("class", "thumbnail");
        img.onload = function() {
          $(event.target).trigger("logarea-before-message-change");
          $(link).empty().append(img);
        };
        img.src = link.href;
      });
    });
  };
});
