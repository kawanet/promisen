/**
 * promisen.js - generates function works easy with Promise.
 *
 * @module promisen
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @see https://gist.github.com/kawanet/4933e5ae9f39942e7564
 */

(function(module, window) {
  /*jshint eqnull:true */

  // node.js
  if (module) module.exports = promisen;

  // browsers
  if (!module && window) window.promisen = promisen;

  // use polifill or not
  var polyfill = ("undefined" === typeof Promise && "undefined" !== typeof require);
  promisen.Promise = polyfill ? require("es6-promise").Promise : Promise;

  // methods
  promisen.series = series;
  promisen.createConditional = createConditional;
  promisen.createCounter = _Number;
  promisen.createStack = _Array;
  promisen.Array = _Array;
  promisen.Number = _Number;

  /**
   * Generates a task function which returns a promise (thenable) object.
   * It uses Promise if available, or uses "es6-promise" polyfill library instead.
   * Following types of tasks are available:
   *
   * 1. function
   * 2. promise object
   * 3. thenable object
   * 4. any other constant object or value
   * 5. multiple values of above
   *
   * @class promisen
   * @function promisen
   * @param task {Function|Promise|thenable|*}
   * @returns {Function}
   * @see https://www.npmjs.com/package/es6-promise
   * @see promisen.series()
   * @example
   * var promisen = require("promisen");
   *
   * // wrap a single function
   * var wrapped = promisen(function() {...});
   * wrapped(value).then(function(result) {...});
   *
   * // composite multiple tasks
   * var joined = promisen(func, promise, thenable, object);
   * joined(value).then(function(result) {...});
   *
   * // swtich to another Promise library such as Q
   * promisen.Promise = require("q");
   */

  function promisen(task) {
    if (arguments.length > 1) return series(arguments);
    if (task instanceof Function) return executable;
    if (task == null) return resolve;
    if (!arguments.length) return resolve;
    task = promisen.Promise.resolve(task);
    return constant;

    // return the constant value
    function constant() {
      return task;
    }

    // return a result from the function
    function executable(value) {
      return promisen.Promise.resolve(task.call(this, value));
    }
  }

  function resolve(value) {
    return promisen.Promise.resolve(value);
  }

  /**
   * creates a task function which runs multiple tasks in order.
   *
   * @class promisen
   * @function series
   * @param tasks {Array|Array-like} list of tasks
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // generate a task function
   * var task = promisen.series([task1, task2, task3,...]);
   *
   * // execute it
   * task(value).then(function(result) {...});
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target, value).then(function(result) {...});
   */

  function series(tasks) {
    var Promise = promisen.Promise;
    if (tasks == null) return promisen();
    tasks = Array.prototype.map.call(tasks, recursive);
    return composite;

    // composite multiple tasks
    function composite(value) {
      return tasks.reduce(chain.bind(this), Promise.resolve(value));
    }

    // use the first argument only. ignore rest.
    function recursive(task) {
      if ("undefined" === typeof task || task === null) return null;
      return promisen(task);
    }

    // chain tasks
    function chain(promise, func) {
      return func ? promise.then(func.bind(this)) : promise;
    }
  }

  /**
   * creates a task function which runs a task assigned by a conditional task
   *
   * @class promisen
   * @function createConditional
   * @param [condTask] {Function|Promise|thenable|*} condition task
   * @param [trueTask] {Function|Promise|thenable|*} task runs when true
   * @param [falseTask] {Function|Promise|thenable|*} task runs when false
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // generate a task function
   * var task = promisen.createConditional(condTask, trueTask, falseTask);
   *
   * // execute it
   * task().then(function(result) {...});
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target).then(function(result) {...});
   *
   * // all three arguments are optional.
   * var runWhenTrueTask = promisen.createConditional(null, trueTask);
   * Promise.resolve(value).then(runWhenTrueTask).then(function(result) {...});
   *
   * // conditional task are also available in a series of promisen tasks
   * var joined = promisen(task1, runWhenTrueTask, task2);
   * joined().then(function(result) {...});
   */

  function createConditional(condTask, trueTask, falseTask) {
    condTask = (condTask != null) ? promisen(condTask) : promisen();
    trueTask = (trueTask != null) ? promisen(trueTask) : promisen();
    falseTask = (falseTask != null) ? promisen(falseTask) : promisen();
    return conditional;

    function conditional(value) {
      var condFunc = condTask.bind(this, value);
      var trueFunc = trueTask.bind(this, value);
      var falseFunc = falseTask.bind(this, value);
      return condFunc().then(switching);

      function switching(condition) {
        return condition ? trueFunc() : falseFunc();
      }
    }
  }

  /**
   * create a counter which has methods: incr(), decr(), get() and set()
   *
   * @class promisen
   * @function createCounter
   * @param [count] {Number} default count: 0
   * @returns {promisen.Number}
   * @example
   * var promisen = require("promisen");
   *
   * // creates a conter
   * var counter = createCounter(123);
   * console.log("count: " + counter); // => count: 123
   * counter.incr(); // increment
   * console.log("count: " + counter); // => count: 124
   * counter.decr(); // decrement
   * console.log("count: " + counter); // => count: 123
   *
   * // methods are available in a series of promisen tasks
   * var tasks = promisen(counter.set, task1, counter.incr, task2, counter.get, task3, counter.decr, task4);
   * tasks(0);
   */

  function _Number(count) {
    if (!(this instanceof _Number)) return new _Number(count);
    this[0] = count - 0 || 0;
  }

  _Number.prototype = {
    0: 0, // value holder
    length: 1, // always hold one value
    incr: _incr,
    decr: _decr,
    "get": _get,
    "set": _set,
    valueOf: _valueOf
  };

  function _incr(value) {
    this[0]++;
    return resolve(value);
  }

  function _decr(value) {
    this[0]--;
    return resolve(value);
  }

  function _get() {
    return resolve(this[0]);
  }

  function _set(value) {
    this[0] = value - 0 || 0;
    return resolve(value);
  }

  function _valueOf() {
    return this[0];
  }

  /**
   * creates a stack which has push() and pop() methods.
   *
   * @class promisen
   * @function createStack
   * @returns {promisen.Array}
   * @example
   * var promisen = require("promisen");
   *
   * // creates a stack
   * var stack = createStack();
   * counter.push("X");
   * console.log("length: " + stack.length); // => length: 1
   * counter.pop().then(function(result) {...}); // => "X"
   * console.log("length: " + stack.length); // => length: 0
   *
   * // methods are available in a series of promisen tasks
   * var tasks = promisen(task1, stack.push, task2, stack.pop, task3);
   * tasks();
   */

  function _Array() {
    if (!(this instanceof _Array)) return new _Array();
  }

  _Array.prototype = {
    length: 0,
    push: _push,
    pop: _pop
  };

  function _push(value) {
    Array.prototype.push.call(this, value); // copy
    return resolve(value); // through
  }

  function _pop() {
    var value = Array.prototype.pop.call(this);
    return resolve(value);
  }

})("undefined" !== typeof module && module, "undefined" !== typeof window && window);
