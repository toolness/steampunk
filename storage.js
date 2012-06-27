var fs = require('fs'),
    path = require('path');

function keypath(key) {
  return path.join(__dirname, 'storage-data', key + '.json');
}

exports.removeSync = function(key) {
  try {
    fs.unlinkSync(keypath(key));
  } catch (e) {}
}

exports.loadSync = function(key) {
  var abspath = keypath(key);
  var data = {};
  try {
    data = JSON.parse(fs.readFileSync(abspath, 'utf8'));
  } catch (e) {
    //console.warn("read of data/" + key + ".json failed: " + e);
  }
  var self = {
    get: function(name, defaultValue) {
      if (!(name in data))
        return defaultValue;
      return data[name];
    },
    addToSetSync: function(name, item) {
      var set = this.get(name, []);
      var index = set.indexOf(item);
      if (index == -1) {
        set.push(item);
        this.setSync(name, set);
      }
    },
    removeFromSetSync: function(name, item) {
      var set = this.get(name, []);
      var index = set.indexOf(item);
      if (index != -1) {
        set.splice(index, 1);
        this.setSync(name, set);
      }
    },
    setSync: function(name, value) {
      data[name] = value;
      fs.writeFileSync(abspath, JSON.stringify(data, null, 2), 'utf8');
    }
  };
  return self;
};
