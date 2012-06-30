(function(jQuery) {
  var scrollToTimeout;

  jQuery.fn.extend({
    addToLog: function(messages, forceScroll) {
      var MOUSEWHEEL_EVT = "mousewheel DOMMouseScroll";

      messages = $(messages);
      
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

      // We don't want to annoy the user by scrolling to the bottom if
      // they're reading something important in the backbuffer, so only
      // auto-scroll if they're already at the bottom of the document.
      if (forceScroll || isScrolledToBottom())
        scrollToBottomOfMessages();

      // TODO: If they're not at the bottom of the document, display some
      // other form of visual indication to let them know that new messages
      // have arrived.
      this.appendTo(messages);
      return this;
    }
  });
})(jQuery);
