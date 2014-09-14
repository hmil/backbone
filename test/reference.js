(function() {
  'use strict';
  var Mod, m, p, col, colRef, Parent;

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
      }))();
      colRef = new (Backbone.Collection.extend({
        model: col.Reference
      }))();
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

  test('Two ways to construct a reference', 2, function() {
    col.add(m);
    var ref1 = new col.Reference(1);
    var ref2 = new col.Reference({id: 1});

    equal(ref1.get('foo'), 'bar');
    equal(ref2.get('foo'), 'bar');
  });

  test('Adding a bunch of refs to a collection', 2, function() {
    col.add([m, p]);
    colRef.add([1, 2]);

    equal(colRef.get(1).get('foo'), 'bar');
    equal(colRef.get(2).get('foo'), 'loup');
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
    equal(ref.staticParent, 'test', 'and through prototype inheritance');
  });

  test('Setting attributes through a reference', 2, function() {
    col.add(m);
    var ref = new col.Reference(1);
    ref.set('foo', 'fifoo');
    equal(ref.get('foo'), 'fifoo');
    equal(m.get('foo'), 'fifoo');
  });

  test('Collections of references', 6, function() {
    col.add(m);
    col.add(p);
    colRef.add([{id: 1}, {id: 2}]);
    equal(colRef.size(), 2);
    equal(colRef.get(1).get('foo'), 'bar');
    equal(colRef.get(2).get('foo'), 'loup');
    colRef.remove(1);
    equal(colRef.size(), 1);
    equal(colRef.get(2).get('foo'), 'loup');
    colRef.remove(colRef.first());
    equal(colRef.size(), 0);
  });

  test('attributes-related queries on collections of references', 2, function() {
    col.add([m, p, {
      id: 3,
      foo: 'bar'
    }]);

    colRef.add([1, 2, 3]);

    _(col.where({foo: 'bar'})).each(function(ref) {
      equal(ref.get('foo'), 'bar');
    });
  });

  test('setting a reference with a model or a reference', 4, function() {
    col.add([m, p]);
    var ref = colRef.add(col.get(1));
    ok(ref instanceof col.Reference);
    equal(ref.get('foo'), 'bar');

    ref = colRef.add(new col.Reference(1));
    ok(ref instanceof col.Reference);
    equal(ref.get('foo'), 'bar');
  });

  // TODO: polymorph collections should accept reference as one of their ctr
  test('polymorph collections with reference', 4, function() {
    var poCol = new Backbone.Collection();
    poCol.model = function(attrs, options) {
      if (attrs && _.has(attrs, 'foo'))
        return new Mod(attrs, options);
      else 
        return new col.Reference(attrs, options);
    };
    col.add(p);
    poCol.add(m);
    poCol.add(2);

    ok(poCol.get(1) instanceof Backbone.Model);
    ok(poCol.get(2) instanceof col.Reference);
    equal(poCol.get(1).get('foo'), 'bar');
    equal(poCol.get(2).get('foo'), 'loup');
  });
})();
