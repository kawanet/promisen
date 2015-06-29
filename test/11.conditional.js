#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  var undefined = void 0;
  var TVALUES = [1, 0, true, false, "", {}, [], null, undefined];

  describe("initialize:", function() {
    it("promisen.if()", function() {
      assert.ok(promisen.if() instanceof Function);
      assert.ok(promisen.if()().then instanceof Function);
    });
  });

  describe("through:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen.if()(" + typestr(tvalue) + ").then()", function(done) {
        promisen.if()(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("conditional:", function() {
    it("promisen.if(true,1,2)().then() => 1", function(done) {
      promisen.if(true, 1, 2)().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("promisen.if(false,1,2)().then() => 2", function(done) {
      promisen.if(false, 1, 2)().then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
    it("promisen.if(null,1,2)(true).then() => 1", function(done) {
      promisen.if(null, 1, 2)(true).then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("promisen.if(null,1,2)(false).then() => 2", function(done) {
      promisen.if(null, 1, 2)(false).then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
  });

  describe("async function:", function() {
    it("promisen.if(ASYNC_TRUE,1,2)().then() => 1", function(done) {
      promisen.if(async_function(true), 1, 2)().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("promisen.if(ASYNC_FALSE,1,2)().then() => 2", function(done) {
      promisen.if(async_function(false), 1, 2)().then(wrap(done, function(value) {
        assert.equal(2, value);
      }));
    });
    it("promisen.if(true,ASYNC_1,ASYNC_2)().then() => 1", function(done) {
      promisen.if(true, async_function(1), async_function(2))().then(wrap(done, function(value) {
        assert.equal(1, value);
      }));
    });
    it("promisen.if(false,ASYNC_1,ASYNC_2)().then() => 2", function(done) {
      promisen.if(false, async_function(1), async_function(2))().then(wrap(done, function(value) {
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
