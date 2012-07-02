defineTests([
  "jquery",
  "users",
  "user-list-view"
], function($, Users, UserListView) {
  describe('UserListView', function() {
    it('should contain added users', function() {
      var view = new UserListView(new Users(), $('<div></div>'));
      view.users.add(["bob", "jane"], "#a");
      expect(view.el.children()).to.have.length(2);
    });

    it('should order users alphabetically & case-insensitively', function() {
      var view = new UserListView(new Users(), $('<div></div>'));
      view.users.add(["c", "B", "a", "D"], "#a");
      expect(view.el.find(".nick").text()).to.be("aBcD");
    });

    it('should not contain duplicate entries', function() {
      var view = new UserListView(new Users(), $('<div></div>'));
      view.users.add(["bob", "jane"], "#a");
      view.users.add(["joe", "jane"], "#a");
      expect(view.el.find(".nick").text()).to.be("bobjanejoe");
    });

    it('should not contain removed users', function() {
      var view = new UserListView(new Users(), $('<div></div>'));
      view.users.add(["bob", "jane"], "#a");
      view.users.add(["joe", "jane"], "#b");
      view.users.remove("bob");
      expect(view.el.find(".nick").text()).to.be("janejoe");
      view.users.remove("joe", "#b");
      expect(view.el.find(".nick").text()).to.be("jane");
    });

    it('should contain renamed users', function() {
      var view = new UserListView(new Users(), $('<div></div>'));
      view.users.add(["bob", "jane"], "#a");
      view.users.rename("bob", "zangief");
      expect(view.el.find(".nick").text()).to.be("janezangief");
    });
  });
});
