#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var createStack = require("../promisen").createStack;

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("initialize:", function() {
    it("createStack()", function() {
      var stack = createStack();
      assert.ok(stack.push instanceof Function);
      assert.ok(stack.push().then instanceof Function);
      assert.ok(stack.pop instanceof Function);
      assert.ok(stack.pop().then instanceof Function);
    });
  });

  describe("push(), pop()", function() {
    it("createStack().push()", function(done) {
      var stack = createStack();
      assert.equal(0, stack.length);
      stack.push("X");
      assert.equal(1, stack.length);
      stack.push("Y");
      assert.equal(2, stack.length);
      stack.push("Z");
      assert.equal(3, stack.length);
      assert.equal("X", stack[0]);
      assert.equal("Y", stack[1]);
      assert.equal("Z", stack[2]);
      stack.pop();
      stack.pop();
      assert.equal(1, stack.length);
      stack.pop().then(wrap(done, function(value) {
        assert.equal(0, stack.length);
        assert.equal("X", value);
      }));
    });
    var OBJECT = {};
    it("createStack().push(OBJECT).then() => OBJECT", function(done) {
      createStack().push(OBJECT).then(wrap(done, function(value) {
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
