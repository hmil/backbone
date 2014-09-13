(function() {

  var Mod, m, p, col, Parent;

  module('Backbone.Collection.Reference', {

    setup: function() {
      Parent = Backbone.Model.extend({
        superFunction: function() {
          return 'hello';
        },
        staticParent: 'test'
      });

      Mod = Parent.extend({
        schema: {
          foo: String,
          life: Number
        },
        megaFunction: function() {
          return this.get('foo') + this.get('life');
        },
        staticChild: 'test'
      });
      col = new (Backbone.Collection.extend({
        model: Mod
      }));
      m   = new Mod({
        id: 1,
        foo: 'bar',
        life: 42
      });
      p   = new Mod({
        id: 2,
        foo: 'loup'
      });
    }

  });

  test('Reference gives access to attributes', 2, function() {
    col.add(m);
    var ref = new col.Reference(1);
    equal(ref.get('foo'), 'bar');
    equal(ref.get('life'), 42);
  });

  test('Reference proxies model methods', 2, function() {
    col.add(m);
    var ref = new col.Reference(1);
    equal(ref.megaFunction(), 'bar42', 'directly');
    equal(ref.superFunction(), 'hello', 'and through prototype inheritance');
  });

  test('Reference proxies model static attributes', 2, function() {
    col.add(m);
    var ref = new col.Reference(1);
    equal(ref.staticChild, 'test', 'directly');
    equal(ref.staticChild, 'test', 'and through prototype inheritance');
  });

  test('Setting attributes through a reference', 2, function() {
    col.add(m);
    var ref = new col.Reference(1);
    ref.set('foo', 'fifoo');
    equal(ref.get('foo'), 'fifoo');
    equal(m.get('foo'), 'fifoo');
  });

  test('Setting pointed model', 1, function() {
    col.add(m);
    col.add(p);
    var ref = new col.Reference(1);
    ref.set(2);
    equal(ref.get('foo'), 'loup');
  });

})();
