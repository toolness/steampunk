defineTests([
  "jquery",
  "event-emitter",
  "users",
  "main"
], function($, EventEmitter, Users, main) {
  describe('main app', function() {
    it('should tell user to login', function() {
      var login = {
        get: function() {
          return null;
        }
      };
      var irc = EventEmitter.create();
      irc.users = new Users();
      var messages = $('<div></div>');
      var app = main({
        root: $('<div></div>'),
        users: $('<div></div>'),
        commandLine: $('<div></div>'),
        messages: messages,
        irc: irc,
        login: login,
        personaLogin: {
          show: function(options) {
            options.logArea.log("use the /login command");
          }
        }
      });
      expect(messages.text()).to.match(/use the \/login command/);
    });
  });
});
