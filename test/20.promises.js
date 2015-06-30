#!/usr/bin/env mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");

describe(TESTNAME + " testing", function() {
  test("es6-promise:", function() {
    return require("es6-promise").Promise
  });
  test("kew:", function() {
    return require("kew");
  });
  test("q:", function() {
    return require("q")
  });
  test("bluebird:", function() {
    return require("bluebird")
  });
  test("rsvp:", function() {
    return require("rsvp")
  });
});

function test(name, loader) {
  var PromiseClass;
  var promiseConstructor;
  var promiseName;
  var desc = describe;

  try {
    PromiseClass = loader();
    promiseConstructor = PromiseClass.resolve().constructor;
    promiseName = promiseConstructor.name;
  } catch (e) {
    desc = describe.skip;
    name += " " + e;
  }

  desc(name, function() {
    it("promisen()() => " + promiseName, function() {
      promisen.Promise = PromiseClass;
      assert.ok(promisen() instanceof Function);
      assert.ok(promisen()() instanceof promiseConstructor);
      assert.ok(promisen()().then instanceof Function); // thenable
    });

    it("promisen.waterfall([SYNC_TASK, SYNC_TASK])(1).then()", function(done) {
      promisen.Promise = PromiseClass;
      promisen.waterfall([syncTask, syncTask])(1).then(wrap(done, function(value) {
        assert.equal(4, value);
      }));
    });

    it("promisen.series([ASYNC_TASK, ASYNC_TASK])(1).then()", function(done) {
      promisen.Promise = PromiseClass;
      promisen.series([asyncTask, asyncTask])(1).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal(2, array[0]);
        assert.equal(2, array[1]);
      }));
    });

    it("promisen.parallel([ASYNC_TASK, ASYNC_TASK])(1).then()", function(done) {
      promisen.Promise = PromiseClass;
      promisen.parallel([asyncTask, asyncTask])(1).then(wrap(done, function(array) {
        assert.equal(2, array.length);
        assert.equal(2, array[0]);
        assert.equal(2, array[1]);
      }));
    });
  });
}

function syncTask(value) {
  return value * 2;
}

function asyncTask(value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(value * 2);
    }, 100);
  });
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