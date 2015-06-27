#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  var undefined = void 0;
  var TVALUES = [1, 0, true, false, "", {}, [], null, undefined];

  describe("multiple values:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen.series([1,2,3," + typestr(tvalue) + "])().then()", function(done) {
        promisen.series([1, 2, 3, tvalue])().then(wrap(done, function(value) {
          if (tvalue === null || tvalue === undefined) {
            assert.equal(3, value); // returns previous argument
          } else {
            assert.equal(tvalue, value);
            assert.ok(tvalue === value);
          }
        }));
      });
    });
  });

  describe("series of functions:", function() {
    it("promisen.series([SYNC_FUNCTION,SYNC_FUNCTION])(1).then()", function(done) {
      promisen.series([incr_function, incr_function])(1).then(wrap(done, function(value) {
        assert.equal(3, value);
      }));
    });
    it("promisen.series([ASYNC_FUNCTION,ASYNC_FUNCTION])(1).then()", function(done) {
      promisen.series([async_function, async_function])(1).then(wrap(done, function(value) {
        assert.equal(3, value);
      }));
    });
    it("promisen.series([BOUND_FUNCTION,BOUND_FUNCTION]).call(OBJECT).then()", function(done) {
      var object = new AnObject();
      promisen.series([bind_target, bind_target]).call(object).then(wrap(done, function(array) {
        assert.equal("AnObject-AnObject", array.join("-"));
      }));
    });
  });

  describe("invalid arguments:", function(done) {
    it("promisen.series()", function() {
      var task = promisen.series(); // empty task
      assert.equal("function", typeof task);
      task("X").then(wrap(done, function(value) {
        assert.equal("X", value);
      }));
    });
    it("promisen.series(null)", function(done) {
      var task = promisen.series(null); // empty task
      assert.equal("function", typeof task);
      task("Y").then(wrap(done, function(value) {
        assert.equal("Y", value);
      }));
    });
    it("promisen.series(0)", function(done) {
      var task = promisen.series(0); // invalid task ignored
      assert.equal("function", typeof task);
      task("Z").then(wrap(done, function(value) {
        assert.equal("Z", value);
      }));
    });
    it("promisen.series(1)", function(done) {
      var task = promisen.series(1); // invalid task ignored
      assert.equal("function", typeof task);
      task("W").then(wrap(done, function(value) {
        assert.equal("W", value);
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
      return resolve(value + 1);
    }, 1);
  });
}

function bind_target(array) {
  if (!array) array = [];
  array.push(this.constructor.name);
  return array;
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

function AnObject() {

}