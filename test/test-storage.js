var expect = require('expect.js'),
    storage = require('../storage').configure({
      rootDir: __dirname
    });

describe('storage.get()', function() {
  it('should return whole blob when called w/ no args', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('u', 'dork');
    expect(blargle.get()).to.eql({u: 'dork'});
  });
});

describe('storage.removeSync()', function() {
  it('should work', function() {
    storage.removeSync('blargle');
    var blargle = storage.loadSync('blargle');
    blargle.setSync('u', 'dork');
    expect(storage.loadSync('blargle').get('u')).to.be('dork');
    storage.removeSync('blargle');
    expect(storage.loadSync('blargle').get('u', 'not here'))
      .to.be('not here');
  });
});

describe('storage.load()', function() {
  function setup() {
    storage.removeSync('blargle');
    var blargle = storage.loadSync('blargle');
    blargle.setSync('u', 'dork');
  }

  it('should work w/ options', function(done) {
    setup();
    storage.load('blargle', {blah: 1}, function(err, asyncBlargle) {
      expect(err).to.be(null);
      expect(asyncBlargle.get('u')).to.eql('dork');
      done();
    });
  });

  it('should work w/o options', function(done) {
    setup();
    storage.load('blargle', function(err, asyncBlargle) {
      expect(err).to.be(null);
      expect(asyncBlargle.get('u')).to.eql('dork');
      done();
    });
  });
});

describe('storage.removeFromSetSync()', function() {
  it('should remove existing entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.removeFromSetSync('beets', 2);
    expect(blargle.get('beets')).to.eql([1,3]);
    storage.removeSync('blargle');
  });

  it('should be synonymous w/ removeFromSet()', function() {
    var blargle = storage.loadSync('blargle');
    expect(blargle.removeFromSetSync).to.be(blargle.removeFromSet);    
  });
});

describe('storage.addToSetSync()', function() {
  it('should add nonexistent entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.addToSetSync('beets', 4);
    expect(blargle.get('beets')).to.eql([1,2,3,4]);
    storage.removeSync('blargle');
  });

  it('should not add duplicate entries', function() {
    var blargle = storage.loadSync('blargle');
    blargle.setSync('beets', [1,2,3]);
    blargle.addToSetSync('beets', 2);
    expect(blargle.get('beets')).to.eql([1,2,3]);
    storage.removeSync('blargle');
  });

  it('should be synonymous w/ addToSet()', function() {
    var blargle = storage.loadSync('blargle');
    expect(blargle.addToSetSync).to.be(blargle.addToSet);    
  });
});

describe('storage.setSync()', function() {
  it('should be synonymous w/ set()', function() {
    var blargle = storage.loadSync('blargle');
    expect(blargle.setSync).to.be(blargle.set);    
  });
});

describe('storage._sizedPush()', function() {
  it('should do nothing when list <= max size', function() {
    var list = [1,2,3];
    storage._sizedPush(list, 4, 4);
    expect(list).to.eql([1,2,3,4]);
  });
  
  it('should remove front items when list > max size', function() {
    var list = [1,2,3];
    storage._sizedPush(list, 4, 3);
    expect(list).to.eql([2,3,4]);
  });
});
