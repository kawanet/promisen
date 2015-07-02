#!/usr/bin/env mocha -R spec

var assert = require("assert");

var TESTNAME = __filename.replace(/^.*\//, "");
var promisen = require("../promisen");
var Promise = require("es6-promise").Promise;

describe(TESTNAME + " testing", function() {
  describe("single:", function() {
    it("typeof", function() {
      assert.ok("function", typeof promisen.single);
      assert.ok("function", typeof promisen.single());
      assert.ok("function", typeof promisen.single()().then);
    });

    var tick1 = 50;
    var tick4 = tick1 * 4;
    var tick9 = tick1 * 9;
    var wait3 = promisen.wait(tick4);
    var wait9 = promisen.wait(tick9);

    it("promisen.single(wait)", function(done) {
      var start = new Date();
      var task = promisen.single(wait3, tick9);
      task("X").then(wrap(done, function(value) {
        assert.equal(value, "X");
        assert.ok(new Date() - start > (tick4 - tick1));
      })).catch(done);
    });

    it("promisen.single(wait) X 5", function(done) {
      var start = new Date();
      var single = promisen.single(wait3, tick9);
      var multi = [single, single, single, single, single];
      var task = promisen.parallel(multi);
      task("Y").then(wrap(done, function(array) {
        assert.equal(array.length, multi.length);
        assert.equal(array.pop(), "Y");
        assert.equal(array.shift(), "Y");
        assert.ok(new Date() - start > (tick4 - tick1));
      })).catch(done);
    });

    it("promisen.single(wait) -> timeout", function(done) {
      var task = promisen.single(wait9, tick4);
      task("X").then(function(value) {
        console.warn("resolve:", value);
      });
      setTimeout(function() {
        var start = new Date();
        task("Y").then(wrap(done, function(value) {
          throw new Error("shold not success");
        })).catch(wrap(done, function(reason) {
          assert.ok(reason instanceof Error);
          assert.ok(new Date() - start > (tick4 - tick1 * 2));
        }));
      }, tick1);
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
  };
}
