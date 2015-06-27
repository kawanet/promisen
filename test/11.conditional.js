#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var createConditional = require("../promisen").createConditional;

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  var undefined = void 0;
  var TVALUES = [1, 0, true, false, "", {}, [], null, undefined];

  describe("initialize:", function() {
    it("createConditional()", function() {
      assert.ok(createConditional() instanceof Function);
      assert.ok(createConditional()().then instanceof Function);
    });
  });

  describe("through:", function() {
    TVALUES.forEach(function(tvalue) {
      it("createConditional()(" + typestr(tvalue) + ").then()", function(done) {
        createConditional()(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("conditional:", function() {
    it("createConditional(true,1,2)().then() => 1", function(done) {
      createConditional(true, 1, 2)().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("createConditional(false,1,2)().then() => 2", function(done) {
      createConditional(false, 1, 2)().then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
    it("createConditional(null,1,2)(true).then() => 1", function(done) {
      createConditional(null, 1, 2)(true).then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("createConditional(null,1,2)(false).then() => 2", function(done) {
      createConditional(null, 1, 2)(false).then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
  });

  describe("async function:", function() {
    it("createConditional(ASYNC_TRUE,1,2)().then() => 1", function(done) {
      createConditional(async_function(true), 1, 2)().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("createConditional(ASYNC_FALSE,1,2)().then() => 2", function(done) {
      createConditional(async_function(false), 1, 2)().then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
    it("createConditional(true,ASYNC_1,ASYNC_2)().then() => 1", function(done) {
      createConditional(true, async_function(1), async_function(2))().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("createConditional(false,ASYNC_1,ASYNC_2)().then() => 2", function(done) {
      createConditional(false, async_function(1), async_function(2))().then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
  });
});

function async_function(value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(value);
    }, 1);
  });
}

function typestr(tvalue) {
  if ("undefined" === typeof tvalue) return "undefined";
  if ("string" === typeof tvalue) return "String";
  if ("object" !== typeof tvalue) return tvalue + "";
  if (tvalue instanceof Array) return "Array";
  if (tvalue === null) return "null";
  return "Object";
}

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
