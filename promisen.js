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
  promisen.IF = promisen["if"] = IF;
  promisen.WHILE = promisen["while"] = WHILE;

  // counter operations
  promisen.incr = incr;
  promisen.decr = decr;

  // array operations
  promisen.push = push;
  promisen.pop = pop;
  promisen.top = top;

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
    if (tasks == null) return promisen();
    tasks = Array.prototype.map.call(tasks, recursive);
    return composite;

    // composite multiple tasks
    function composite(value) {
      return tasks.reduce(chain.bind(this), resolve(value));
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
   * @function if
   * @param [condTask] {Function|Promise|thenable|*} condition task
   * @param [trueTask] {Function|Promise|thenable|*} task runs when true
   * @param [falseTask] {Function|Promise|thenable|*} task runs when false
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // generate a task function
   * var task = promisen.if(condTask, trueTask, falseTask);
   *
   * // execute itl[pi?K  jk ln lml;/,   m /P/.[h
   * task().then(function(result) {...});
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target).then(function(result) {...});
   *
   * // all three arguments are optional.
   * var runWhenTrueTask = promisen.if(null, trueTask);
   * Promise.resolve(value).then(runWhenTrueTask).then(function(result) {...});
   *
   * // conditional task are also available in a series of promisen tasks
   * var joined = promisen(task1, runWhenTrueTask, task2);
   * joined().then(function(result) {...});
   *
   * // use uglify --compress (or UPPERCASE property name) for IE8
   * var task = promisen["if"](condTask, trueTask, falseTask);
   * var task = promisen.IF(condTask, trueTask, falseTask);
   */

  function IF(condTask, trueTask, falseTask) {
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
   * creates a task function which runs a task repeatedly while a conditional task returns true.
   *
   * @param condTask {Function|Promise|thenable|*} condition task
   * @param runTask {Function|Promise|thenable|*} task runs while true
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // counter = 8; while (--counter) { runTask }
   * var counter = promisen.number(8);
   * var whileTask = promisen.while(counter.decr, runTask);
   *
   * // for (initTask; condTask; afterTask) { runTask }
   * var forTask = promisen(initTask, promisen.while(condTask, runTask, afterTask));
   *
   * // do { runTask } while (condTask)
   * var doWhileTask = promisen.while(null, condTask, runTask));
   */

  function WHILE(condTask, runTask) {
    condTask = (condTask != null) ? promisen(condTask) : promisen();
    var runTasks = Array.prototype.slice.call(arguments, 1);
    runTasks.push(nextTask);
    runTask = series(runTasks);
    var whileTask = IF(condTask, runTask);
    return whileTask;

    function nextTask(value) {
      return whileTask.call(this, value);
    }
  }

  /**
   * creates a task function which increments a counter.
   *
   * @class promisen
   * @function incr
   * @param array {Array|Array-like} counter holder
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var counter = [123];
   * console.log("count: " + counter); // => count: 123
   * var incrTask = counter.incr();
   * incrTask().then(function(value) {...}); // => count: 124
   *
   * // incrTask is available in a series of tasks.
   * var task = promisen(otherTask, incrTask);
   */

  function incr(array) {
    return incrTask;

    function incrTask() {
      if (!array.length) {
        Array.prototype.push.call(array, 0 | 0);
      }
      return resolve(++array[array.length - 1]);
    }
  }

  /**
   * creates a task function which decrements a counter.
   *
   * @class promisen
   * @function decr
   * @param array {Array|Array-like} counter holder
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var counter = [123];
   * console.log("count: " + counter); // => count: 123
   * var decrTask = counter.decr();
   * decrTask().then(function(value) {...}); // => count: 122
   *
   * // decrTask is available in a series of tasks.
   * var task = promisen(otherTask, decrTask);
   */

  function decr(array) {
    return decrTask;

    function decrTask() {
      if (!array.length) {
        Array.prototype.push.call(array, 0 | 0);
      }
      return resolve(--array[array.length - 1]);
    }
  }

  /**
   * creates a task function which stores a value into the array
   *
   * @class promisen
   * @function push
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   * var stack = [];
   * var task2 = promisen(task1, promisen.push(stack));
   * task2().then(function() {...}); // stack.length == 2
   */

  function push(array) {
    return pushTask;

    function pushTask(value) {
      Array.prototype.push.call(array, value); // copy
      return resolve(value); // through
    }
  }

  /**
   * creates a task function which fetches the last value on the array
   *
   * @class promisen
   * @function pop
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   * var stack = ["foo", "bar"];
   * var task2 = promisen(promisen.pop(stack), task1);
   * task2().then(function() {...}); // stack.length == 1
   */

  function pop(array) {
    return popTask;

    function popTask() {
      var value = Array.prototype.pop.call(array);
      return resolve(value);
    }
  }

  /**
   * creates a task function which inspects the last value on the array
   *
   * @class promisen
   * @function push
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   * var stack = ["foo", "bar"];
   * var task2 = promisen(promisen.top(stack), task1);
   * task2().then(function() {...}); // stack.length == 2
   */

  function top(array) {
    return topTask;

    function topTask() {
      var value = array[array.length - 1];
      return resolve(value);
    }
  }

})("undefined" !== typeof module && module, "undefined" !== typeof window && window);
