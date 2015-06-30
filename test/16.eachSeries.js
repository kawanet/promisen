#!/usr/bin/env mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("eachSeries loop:", function() {
    it("typeof", function() {
      assert.ok("function", typeof promisen.eachSeries);
      assert.ok("function", typeof promisen.eachSeries());
      assert.ok("function", typeof promisen.eachSeries()().then);
    });

    it("promisen.eachSeries(array, runTask)", function(done) {
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

    it("promisen.eachSeries(arrayTask, runTask1, runTask2)", function(done) {
      var source = [1, 2, 3];
      promisen.eachSeries(arrayTask, runTask1, runTask2)().then(wrap(done, function(value) {
        assert.ok(value instanceof Array);
        assert.equal(source.length, value.length);
        assert.equal(source[0] * 2 + 1, value[0]);
        assert.equal(source[1] * 2 + 1, value[1]);
        assert.equal(source[2] * 2 + 1, value[2]);
      }));

      function arrayTask() {
        return source;
      }

      function runTask1(value) {
        value *= 2;
        return value;
      }

      function runTask2(value) {
        value++;
        return value;
      }
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
