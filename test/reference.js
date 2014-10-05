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

  test("Reference proxies change events", 1, function(){
    var col = new Backbone.Collection([{ id: 1, title: 'foo' }]);
    var Mod = Backbone.Model.extend({
      schema: { child: col.Reference }
    });
    var ref = new col.Reference(1);
    ref.on('change', function(){
      ok(true);
    });
    col.first().set('title', 'bar');
  });

  test("removing/adding referenced model triggers change event and binds the model", 3, function() {
    var e_special = false, e_general = false, e_destroyed = false;
    var col = new Backbone.Collection();
    var ref = new col.Reference(1);
    ref.on('change', function(){
      ok(true);
    });
    var mod = col.add({id: 1, title: 'foo'});
    mod.set('a', 'test');
    col.remove(1);
  });

  test("dereference with callback", 1, function() {
    var col = new Backbone.Collection([{id: 1, title: 'foo'}]);
    var ref = new col.Reference(1);
    var title = ref.$(function(m){
      return m.get('title');
    });
    equal(title, 'foo');
  });

  test("lookup operator", 1, function() {
    var Mod = Backbone.Model.extend({
      sync: function(method, model, options){
        options.success({title: 'foo'});
      }
    });
    var col = new (Backbone.Collection.extend({
      model: Mod
    }));
    var ref = new col.Reference(1);
    ref.$$(function(m) {
      equal(m.get('title'), 'foo');
    });
  });

  test("dispose actually makes references unresponsive", 1, function() {
    var col = new Backbone.Collection({id: 1});
    var ref = new col.Reference(1);
    ref.on('change', function(){
      ok(true);
    });
    col.first().set('a', 'a');
    ref.dispose();
    col.first().set('a', 'b');
  });

})();
