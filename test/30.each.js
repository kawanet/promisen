#!/usr/bin/env mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("each/eachSeries loop:", function() {
    it("typeof", function() {
      assert.ok("function", typeof promisen.each);
      assert.ok("function", typeof promisen.each());
      assert.ok("function", typeof promisen.each()().then);
      assert.ok("function", typeof promisen.eachSeries);
      assert.ok("function", typeof promisen.eachSeries());
      assert.ok("function", typeof promisen.eachSeries()().then);
    });

    it("promisen.each(array, iterationTask)", function(done) {
      var source = ["X", "Y", "Z"];
      var result = [];
      promisen.each(source, runTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(3, source.length);
        assert.equal(3, result.length);
        assert.equal(3, value.length);
        assert.equal(source[0], result[0]);
        assert.equal(source[1], value[1]);
        assert.equal(result[2], value[2]);
      }));

      function runTask(value) {
        result.push(value);
        return value;
      }
    });

    it("promisen.each(array, iterationTask, endTask)", function(done) {
      var source = [1, 2, 3];
      promisen.each(source, doubleTask, endTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(source.length, value.length);
        assert.equal(source[0] * 2 + 1, value[0]);
        assert.equal(source[1] * 2 + 1, value[1]);
        assert.equal(source[2] * 2 + 1, value[2]);
      }));

      function endTask(array) {
        return array.map(incrTask);
      }
    });

    it("promisen.each(array, asyncTask)", function(done) {
      var source = [1, 2, 3];
      promisen.each(source, asyncTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(source.length, value.length);
        assert.equal(source[0] + 1, value[0]);
        assert.equal(source[1] + 1, value[1]);
        assert.equal(source[2] + 1, value[2]);
      }));
    });

    it("promisen.eachSeries(array, iterationTask)", function(done) {
      var source = ["X", "Y", "Z"];
      var result = [];
      promisen.eachSeries(source, runTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(3, source.length);
        assert.equal(3, result.length);
        assert.equal(3, value.length);
        assert.equal(source[0], result[0]);
        assert.equal(source[1], value[1]);
        assert.equal(result[2], value[2]);
      }));

      function runTask(value) {
        result.push(value);
        return value;
      }
    });

    it("promisen.eachSeries(array, iterationTask, endTask)", function(done) {
      var source = [1, 2, 3];
      promisen.eachSeries(source, doubleTask, endTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(source.length, value.length);
        assert.equal(source[0] * 2 + 1, value[0]);
        assert.equal(source[1] * 2 + 1, value[1]);
        assert.equal(source[2] * 2 + 1, value[2]);
      }));

      function endTask(array) {
        return array.map(incrTask);
      }
    });

    it("promisen.eachSeries(array, asyncTask)", function(done) {
      var source = [1, 2, 3];
      promisen.eachSeries(source, asyncTask)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(source.length, value.length);
        assert.equal(source[0] + 1, value[0]);
        assert.equal(source[1] + 1, value[1]);
        assert.equal(source[2] + 1, value[2]);
      }));
    });

  });
});

function doubleTask(value) {
  value *= 2;
  return value;
}

function incrTask(value) {
  value++;
  return value;
}

function asyncTask(value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      return resolve(value + 1);
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
  };
}
