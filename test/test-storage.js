var assert = require('assert'),
    storage = require('../storage');

describe('storage.remove()', function() {
  it('should work', function() {
    storage.remove('blargle');
    var blargle = storage.load('blargle');
    blargle.set('u', 'dork');
    assert.equal(storage.load('blargle').get('u'), 'dork');
    storage.remove('blargle');
    assert.equal(storage.load('blargle').get('u', 'not here'), 'not here');
  });
});

describe('storage.removeFromSet()', function() {
  it('should remove existing entries', function() {
    var blargle = storage.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.removeFromSet('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,3]);
    storage.remove('blargle');
  });
});

describe('storage.addToSet()', function() {
  it('should add nonexistent entries', function() {
    var blargle = storage.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.addToSet('beets', 4);
    assert.deepEqual(blargle.get('beets'), [1,2,3,4]);
    storage.remove('blargle');
  });

  it('should not add duplicate entries', function() {
    var blargle = storage.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.addToSet('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,2,3]);
    storage.remove('blargle');
  });
});
