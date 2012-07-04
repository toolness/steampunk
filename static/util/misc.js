"use strict";

define(["jquery"], function($) {
  return {
    doesNickMatch: function(base, actual) {
      var match = actual.match(/^[_]*([A-Za-z0-9]+)/);
      if (!match)
        return false;
      if (match[1] == base || match[1] == base + '1')
        return true;
      return false;
    },
    insertTextIntoField: function(text, input) {
      input = $(input)[0];
      
      // Use selectionEnd instead of selectionStart because Mobile Chrome
      // sometimes selects-all while in weird Android keyboard autocomplete
      // mode.
      var caret = input.selectionEnd;
      var oldVal = $(input).val();
      var newVal = oldVal.slice(0, caret) + text + oldVal.slice(caret);
      var moveCursor = function() {
        if (input.parentNode)
          input.setSelectionRange(caret+text.length, caret+text.length);
      };
      $(input).val(newVal).focus().trigger("change");
      moveCursor();
      // Move the cursor after a bit because Mobile Chrome positions it
      // right before the character we want to be at, for some reason.
      setTimeout(moveCursor, 100);
    }
  };
});
