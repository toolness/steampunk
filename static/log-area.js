"use strict";

define([
  "jquery",
  "underscore",
  "util/linkify",
  "util/pretty-date",
  "text!templates/social-message.html",
  "scrollto.jquery"
], function($, _, linkifyTextToHTML, prettyDate, messageTemplate) {
  function enrichMessageText(text) {
    return linkifyTextToHTML(text, function(anchor) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'nofollow');
    });
  }

  return function LogArea(options) {
    var MOUSEWHEEL_EVT = "mousewheel DOMMouseScroll";
    var socialMessagesLogged = {};
    var messages = $(options.element);
    var twitterUsers = options.twitterUsers;
    var scrollToTimeout;

    function onMouseWheel() {
      // If the user tries to manually scroll while we're auto-scrolling,
      // respect their intentions and abort our auto-scroll.
      messages.unbind(MOUSEWHEEL_EVT, onMouseWheel);
      clearTimeout(scrollToTimeout);
      messages.stop();
    }

    function isScrolledToBottom() {
      var scrollBottom = messages.scrollTop() + messages.outerHeight();
      return (scrollBottom == messages[0].scrollHeight);
    }

    function scrollToBottomOfMessages() {
      messages.bind(MOUSEWHEEL_EVT, onMouseWheel);
      clearTimeout(scrollToTimeout);
      scrollToTimeout = setTimeout(function() {
          messages.scrollTo('max', {
            duration:500,
            onAfter: function() {
              messages.unbind(MOUSEWHEEL_EVT, onMouseWheel);

              // If more messages arrived while we were scrolling,
              // keep scrolling!
              if (!isScrolledToBottom())
                scrollToBottomOfMessages();
            }
          });
      }, 100);
    }

    function addToLog(element, forceScroll) {
      // We don't want to annoy the user by scrolling to the bottom if
      // they're reading something important in the backbuffer, so only
      // auto-scroll if they're already at the bottom of the document.
      if (forceScroll || isScrolledToBottom())
        scrollToBottomOfMessages();

      // TODO: If they're not at the bottom of the document, display some
      // other form of visual indication to let them know that new messages
      // have arrived.
      element.appendTo(messages);
    }
      
    setInterval(function() {
      $("time[data-timestamp]", messages).each(function() {
        var timestamp = $(this).attr("data-timestamp");
        $(this).text(prettyDate(timestamp));
      });
    }, 60000);
  
    messages.on("logarea-before-message-change", function(event) {
      if (isScrolledToBottom())
        scrollToBottomOfMessages();
    });

    return {
      messages: messages,
      logSocialMessage: function logSocialMessage(options) {
        var target = options.target;
        var targetType = (target[0] == "#") ? "channel-msg" : "private-msg";
        var classSuffix = options.className ? (' ' + options.className) : '';
        var timestamp = options.timestamp || Date.now();
        var signature = [target, Math.floor(timestamp / 1000),
                         options.message].join('|');
        
        if (signature in socialMessagesLogged)
          return false;
        else
          socialMessagesLogged[signature] = true;
        
        var html = _.template(messageTemplate, {
          targetType: targetType + classSuffix,
          nick: options.nick,
          target: target,
          html: enrichMessageText(options.message),
          timestamp: timestamp.toString(),
          prettyTime: prettyDate(timestamp)
        }).trim();
        html = $(html);
        
        var avatar = twitterUsers.getAvatarElement(options.nick);
        if (avatar)
          $(".avatar-holder", html).append(avatar);
        
        if (options.where)
          html.appendTo(options.where)
        else
          addToLog(html, options.forceScroll);
        html.trigger("logarea-social-message-added");

        return true;
      },
      log: function log(type, msg) {
        if (msg === undefined) {
          msg = type;
          type = "info";
        }
        addToLog($('<div class="log ' + type + '"></div>').text(msg));
      },
      logElement: function(element, forceScroll) {
        addToLog(element, forceScroll);
      }
    };
  };
});
