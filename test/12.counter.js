#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("initialize:", function() {
    it("promisen.number()", function() {
      var counter = promisen.number();
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
    it("promisen.number(10).get().then() => 10", function(done) {
      promisen.number(10).get().then(wrap(done, function(value) {
        assert.equal(10, value);
      }));
    });
    it("promisen.number().set(20).then() => 20", function(done) {
      promisen.number().set(20).then(wrap(done, function(value) {
        assert.equal(20, value);
      }));
    });
  });

  describe("incr(), decr()", function() {
    it("promisen.number().incr() => 1, 2,...", function(done) {
      var counter = promisen.number();
      assert.equal(0, Number(counter));
      counter.incr();
      assert.equal(1, Number(counter));
      counter.decr();
      assert.equal(0, Number(counter));
      counter.get().then(wrap(done, function(value) {
        assert.equal(0, value);
      }));
    });
    it("promisen.number(10).incr() => 10, 11,...", function(done) {
      var counter = promisen.number(10);
      assert.equal(10, Number(counter));
      counter.incr();
      assert.equal(11, Number(counter));
      counter.decr();
      assert.equal(10, Number(counter));
      counter.get().then(wrap(done, function(value) {
        assert.equal(10, value);
      }));
    });
    var OBJECT = {};
    it("promisen.number().incr(OBJECT).then() => OBJECT", function(done) {
      promisen.number().incr(OBJECT).then(wrap(done, function(value) {
        assert.equal(OBJECT, value);
        assert.ok(OBJECT === value);
      }));
    });
    it("promisen.number().decr(OBJECT).then() => OBJECT", function(done) {
      promisen.number().decr(OBJECT).then(wrap(done, function(value) {
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
