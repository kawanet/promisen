#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("initialize:", function() {
    it("promisen.while()", function() {
      var loop = promisen.while();
      assert.ok(loop instanceof Function);
    });
  });

  describe("while():", function() {

    // while ( condTask ) { runTask1; }
    it("promisen.while(condTask, runTask)", function(done) {
      var counter = promisen.number(5);
      var stack = promisen.stack();
      promisen.while(counter.decr, stack.push)("X").then(wrap(done, function(value) {
        assert.equal(0, counter - 0);
        assert.equal(4, stack.length);
        // condTask's result is ignored.
        // the last stack.push returns the previous value: "X"
        assert.equal("X", value);
      }));
    });

    // while ( condTask ) { runTask1; runTask2; }
    it("promisen.while(condTask, runTask1, runTask2)", function(done) {
      var counter1 = promisen.number(5);
      var counter2 = promisen.number(0);
      var stack = promisen.stack();
      promisen.while(counter1.decr, counter2.incr, stack.push)().then(wrap(done, function(value) {
        assert.equal(0, counter1 - 0);
        assert.equal(4, counter2 - 0);
        assert.equal(4, stack.length);
        assert.equal(4, value);
      }));
    });

    // do { runTask } while ( condTask )
    it("promisen.while(null, runTask, condTask)", function(done) {
      var counter = promisen.number(5);
      var stack = promisen.stack();
      promisen.while(null, stack.push, counter.decr)(true).then(wrap(done, function(value) {
        assert.equal(0, counter - 0);
        assert.equal(5, stack.length);
        assert.equal(0, value);
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
