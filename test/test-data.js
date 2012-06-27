var assert = require('assert'),
    data = require('../data');

describe('data.remove()', function() {
  it('should work', function() {
    data.remove('blargle');
    var blargle = data.load('blargle');
    blargle.set('u', 'dork');
    assert.equal(data.load('blargle').get('u'), 'dork');
    data.remove('blargle');
    assert.equal(data.load('blargle').get('u', 'not here'), 'not here');
  });
});

describe('data.removeFromSet()', function() {
  it('should remove existing entries', function() {
    var blargle = data.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.removeFromSet('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,3]);
    data.remove('blargle');
  });
});

describe('data.addToSet()', function() {
  it('should add nonexistent entries', function() {
    var blargle = data.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.addToSet('beets', 4);
    assert.deepEqual(blargle.get('beets'), [1,2,3,4]);
    data.remove('blargle');
  });

  it('should not add duplicate entries', function() {
    var blargle = data.load('blargle');
    blargle.set('beets', [1,2,3]);
    blargle.addToSet('beets', 2);
    assert.deepEqual(blargle.get('beets'), [1,2,3]);
    data.remove('blargle');
  });
});
