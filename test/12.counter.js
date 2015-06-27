#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var createCounter = require("../promisen").createCounter;

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("initialize:", function() {
    it("createCounter()", function() {
      var counter = createCounter();
      assert.ok(counter.incr instanceof Function);
      assert.ok(counter.incr().then instanceof Function);
      assert.ok(counter.decr instanceof Function);
      assert.ok(counter.decr().then instanceof Function);
      assert.ok(counter.get instanceof Function);
      assert.ok(counter.get().then instanceof Function);
      assert.ok(counter.set instanceof Function);
      assert.ok(counter.set().then instanceof Function);
    });
  });

  describe("get(), set()", function() {
    it("createCounter(10).get().then() => 10", function(done) {
      createCounter(10).get().then(wrap(done, function(value) {
        assert.equal(10, value);
      }));
    });
    it("createCounter().set(20).then() => 20", function(done) {
      createCounter().set(20).then(wrap(done, function(value) {
        assert.equal(20, value);
      }));
    });
  });

  describe("incr(), decr()", function() {
    it("createCounter().incr() => 1, 2,...", function(done) {
      var counter = createCounter();
      assert.equal(0, Number(counter));
      counter.incr();
      assert.equal(1, Number(counter));
      counter.decr();
      assert.equal(0, Number(counter));
      counter.get().then(wrap(done, function(value) {
        assert.equal(0, value);
      }));
    });
    it("createCounter(10).incr() => 10, 11,...", function(done) {
      var counter = createCounter(10);
      assert.equal(10, Number(counter));
      counter.incr();
      assert.equal(11, Number(counter));
      counter.decr();
      assert.equal(10, Number(counter));
      counter.get().then(wrap(done, function(value) {
        assert.equal(10, value);
      }));
    });
    it("createCounter(20,10).incr() => 20, 30,...", function(done) {
      var counter = createCounter(20, 10);
      assert.equal(20, Number(counter));
      counter.incr();
      assert.equal(30, Number(counter));
      counter.decr();
      assert.equal(20, Number(counter));
      counter.get().then(wrap(done, function(value) {
        assert.equal(20, value);
      }));
    });
    var OBJECT = {};
    it("createCounter().incr(OBJECT).then() => OBJECT", function(done) {
      createCounter().incr(OBJECT).then(wrap(done, function(value) {
        assert.equal(OBJECT, value);
        assert.ok(OBJECT === value);
      }));
    });
    it("createCounter().decr(OBJECT).then() => OBJECT", function(done) {
      createCounter().decr(OBJECT).then(wrap(done, function(value) {
        assert.equal(OBJECT, value);
        assert.ok(OBJECT === value);
      }));
    });
  });
});

function wrap(done, test) {
  return function() {
    try {
      test.apply(this, arguments);
      done();
    } catch (e) {
      done(e);
    }
  }
}

