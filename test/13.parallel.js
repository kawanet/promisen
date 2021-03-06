#!/usr/bin/env mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  var undef = void 0;
  var TVALUES = [1, 0, true, false, "", {}, [], null, undef];

  describe("multiple values:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen.parallel([1,2,3," + typestr(tvalue) + "])(10).then()", function(done) {
        promisen.parallel([1, 2, 3, tvalue])(10).then(wrap(done, function(array) {
          assert.equal(4, array.length);
          assert.equal(1, array[0]);
          assert.equal(2, array[1]);
          assert.equal(3, array[2]);
          assert.equal(tvalue, array[3]);
          assert.ok(tvalue === array[3]);
        }));
      });
    });
  });

  describe("parallel of functions:", function() {
    // two sync
    it("promisen.parallel([SYNC_FUNCTION,SYNC_FUNCTION])(10).then()", function(done) {
      promisen.parallel([incr_function, incr_function])(10).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal(11, array[0]);
        assert.equal(11, array[1]);
      }));
    });

    // one sync and one async
    it("promisen.parallel([SYNC_FUNCTION,ASYNC_FUNCTION])(10).then()", function(done) {
      var start = new Date();
      promisen.parallel([incr_function, async_function])(10).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal(11, array[0]);
        assert.equal(9, array[1]);
        var duration = new Date() - start;
        assert.ok(duration > 50);
        assert.ok(duration < 150);
      }));
    });

    // two async
    it("promisen.parallel([ASYNC_FUNCTION,ASYNC_FUNCTION])(10).then()", function(done) {
      var start = new Date();
      promisen.parallel([async_function, async_function])(10).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal(9, array[0]);
        assert.equal(9, array[1]);
        var duration = new Date() - start;
        assert.ok(duration > 50);
        assert.ok(duration < 150);
      }));
    });

    // check bound target
    it("promisen.parallel([BOUND_FUNCTION,BOUND_FUNCTION]).call(OBJECT).then()", function(done) {
      var object = new AnObject();
      promisen.parallel([bind_target, bind_target]).call(object, 10).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal("AnObject", array[0]);
        assert.equal("AnObject", array[1]);
      }));
    });
  });

  describe("invalid arguments:", function(done) {
    it("promisen.parallel()", function() {
      var task = promisen.parallel(); // empty task
      assert.equal("function", typeof task);
      task("X").then(wrap(done, function(array) {
        assert.equal(0, array.length);
      }));
    });
    it("promisen.parallel(null)", function(done) {
      var task = promisen.parallel(null); // empty task
      assert.equal("function", typeof task);
      task("Y").then(wrap(done, function(array) {
        assert.equal(0, array.length);
      }));
    });
    it("promisen.parallel(0)", function(done) {
      var task = promisen.parallel(0);
      assert.equal("function", typeof task);
      task("Z").then(wrap(done, function(array) {
        assert.equal(0, array.length);
      }));
    });
    it("promisen.parallel(1)", function(done) {
      var task = promisen.parallel(1);
      assert.equal("function", typeof task);
      task("W").then(wrap(done, function(array) {
        assert.equal(0, array.length);
      }));
    });
  });
});

function incr_function(value) {
  return value + 1;
}

function async_function(value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(value - 1);
    }, 100);
  });
}

function bind_target() {
  return this.constructor.name;
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
  };
}

function AnObject() {

}