var assert = require('assert'),
    storage = require('../storage');

describe('storage.removeSync()', function() {
  it('should work', function() {
    storage.removeSync('blargle');
    var blargle = storage.loadSync('blargle');
    blargle.setSync('u', 'dork');
    assert.equal(storage.loadSync('blargle').get('u'), 'dork');
    storage.removeSync('blargle');
    assert.equal(storage.loadSync('blargle').get('u', 'not here'),
                 'not here');
  });
});

describe('storage.removeFromSetSync()', function() {
  it('should remove existing entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.removeFromSetSync('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,3]);
    storage.removeSync('blargle');
  });
});

describe('storage.addToSetSync()', function() {
  it('should add nonexistent entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.addToSetSync('beets', 4);
    assert.deepEqual(blargle.get('beets'), [1,2,3,4]);
    storage.removeSync('blargle');
  });

  it('should not add duplicate entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.addToSetSync('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,2,3]);
    storage.removeSync('blargle');
  });
});
