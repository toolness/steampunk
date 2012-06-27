var fs = require('fs'),
    path = require('path');

const DEFAULT_FLUSH_DELAY = 500;

function keypath(key) {
  return path.join(__dirname, 'storage-data', key + '.json');
}

exports._sizedPush = function(list, item, maxSize) {
  list.push(item);
  if (list.length > maxSize)
    list.splice(0, list.length - maxSize);
}

exports.removeSync = function(key) {
  try {
    fs.unlinkSync(keypath(key));
  } catch (e) {}
}

exports.loadSync = function(key, options) {
  options = options || {};
  
  var abspath = keypath(key),
      data = {},
      flushDelay = options.flushDelay || DEFAULT_FLUSH_DELAY,
      flushTimeout;

  try {
    data = JSON.parse(fs.readFileSync(abspath, 'utf8'));
  } catch (e) {
    //console.warn("read of data/" + key + ".json failed: " + e);
  }

  function flush() {
    console.log("FLUSH", key);
    fs.writeFile(abspath, JSON.stringify(data, null, 2), 'utf8');
    flushTimeout = undefined;
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
    },
    appendToList: function(name, options) {
      var list = this.get(name, []);
      exports._sizedPush(list, options.item, options.maxLength);
      data[name] = list;
      if (!flushTimeout)
        flushTimeout = setTimeout(flush, flushDelay);
    }
  };
  return self;
};
