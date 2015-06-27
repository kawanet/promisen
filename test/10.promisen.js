#!/usr/bin/env ../node_modules/.bin/mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");

var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  var undefined = void 0;
  var TVALUES = [1, 0, true, false, "", {}, [], null, undefined];

  describe("initialize:", function() {
    it("promisen()", function() {
      assert.ok(promisen() instanceof Function);
      assert.ok(promisen()().then instanceof Function);
    });
  });

  describe("empty argument:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen()(" + typestr(tvalue) + ").then()", function(done) {
        promisen()(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("static value:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(" + typestr(tvalue) + ")().then()", function(done) {
        promisen(tvalue)().then(wrap(done, function(value) {
          if (tvalue === null || tvalue === undefined) {
            assert.equal(undefined, value); // argument ignored
          } else {
            assert.equal(tvalue, value);
            assert.ok(tvalue === value);
          }
        }));
      });
    });
  });

  describe("multiple values:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(1,2,3," + typestr(tvalue) + ")().then()", function(done) {
        promisen(1, 2, 3, tvalue)().then(wrap(done, function(value) {
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

  describe("through function:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(FUNCTION)(" + typestr(tvalue) + ").then()", function(done) {
        promisen(through_function)(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("resolve function:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(FUNCTION)(" + typestr(tvalue) + ").then()", function(done) {
        promisen(resolve_function)(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("async function:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(FUNCTION)(" + typestr(tvalue) + ").then()", function(done) {
        promisen(async_function)(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });
  });

  describe("promisened function:", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen(promisen())(" + typestr(tvalue) + ").then()", function(done) {
        promisen(promisen())(tvalue).then(wrap(done, function(value) {
          assert.equal(tvalue, value);
          assert.ok(tvalue === value);
        }));
      });
    });

    TVALUES.forEach(function(tvalue) {
      it("promisen(promisen(" + typestr(tvalue) + "))().then()", function(done) {
        promisen(promisen(tvalue))().then(wrap(done, function(value) {
          if (tvalue === null || tvalue === undefined) {
            assert.equal(undefined, value); // argument ignored
          } else {
            assert.equal(tvalue, value);
            assert.ok(tvalue === value);
          }
        }));
      });
    });
  });

  describe("promisened function in then():", function() {
    TVALUES.forEach(function(tvalue) {
      it("promisen()().then(promisen(" + typestr(tvalue) + ")).then()", function(done) {
        promisen()().then(promisen(tvalue)).then(wrap(done, function(value) {
          if (tvalue === null || tvalue === undefined) {
            assert.equal(undefined, value); // argument ignored
          } else {
            assert.equal(tvalue, value);
            assert.ok(tvalue === value);
          }
        }));
      });
    });

    TVALUES.forEach(function(tvalue) {
      it("promisen()(" + typestr(tvalue) + ").then(promisen()).then()", function(done) {
        promisen()(tvalue).then(promisen()).then(wrap(done, function(value) {
          if (tvalue === null || tvalue === undefined) {
            assert.equal(undefined, value); // argument ignored
          } else {
            assert.equal(tvalue, value);
            assert.ok(tvalue === value);
          }
        }));
      });
    });
  });

  describe("bind target object:", function() {
    var object = new AnObject();
    it("promisen(FUNCTION).call(OBJECT).then()", function(done) {
      promisen(bind_target).call(object).then(wrap(done, function(array) {
        assert.equal("AnObject", array.join("-"));
      }));
    });

    it("promisen(FUNCTION,FUNCTION).call(OBJECT).then()", function(done) {
      promisen(bind_target, bind_target).call(object).then(wrap(done, function(array) {
        assert.equal("AnObject-AnObject", array.join("-"));
      }));
    });
  });
});

function bind_target(array) {
  if (!array) array = [];
  array.push(this.constructor.name);
  return array;
}

function through_function(value) {
  return value;
}

function async_function(value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(value);
    }, 1);
  });
}

function resolve_function(value) {
  return Promise.resolve(value);
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