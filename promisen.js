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

  /**
   * Native Promise object or Promise polyfill.
   * "es6-promise" polyfill loaded per default in case no native Promise object ready.
   * Some other libraries which have compatible interface with ES6 Promise are also available:
   * Q, bluebird and RSVP are tested.
   *
   * @class promisen
   * @member Promise {Promise}
   * @static
   * @example
   * var promisen = require("promisen");
   *
   * // https://github.com/jakearchibald/es6-promise (default polyfill)
   * promisen.Promise = require("es6-promise").Promise;
   *
   * // https://github.com/kriskowal/q
   * promisen.Promise = require("q").Promise;
   *
   * // https://github.com/petkaantonov/bluebird
   * promisen.Promise = require("bluebird").Promise;
   *
   * // https://github.com/tildeio/rsvp.js
   * promisen.Promise = require("rsvp").Promise;
   */

  promisen.Promise = polyfill ? require("es6-promise").Promise : Promise;

  // methods
  promisen.waterfall = waterfall;
  promisen.series = series;
  promisen.parallel = parallel;
  promisen.each = each;
  promisen.eachSeries = eachSeries;
  promisen.IF = promisen["if"] = IF;
  promisen.WHILE = promisen["while"] = WHILE;

  // counter operations
  promisen.incr = incr;
  promisen.decr = decr;

  // array operations
  promisen.push = push;
  promisen.pop = pop;
  promisen.top = top;

  // inpsect tasks
  promisen.log = log;
  promisen.warn = warn;

  // wait
  promisen.wait = wait;

  // lock
  promisen.single = single;

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
   * @see promisen.waterfall()
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
   */

  function promisen(task) {
    if (arguments.length > 1) return waterfall(arguments);
    if (task instanceof Function) return executable;
    if (task == null) return resolve;
    if (!arguments.length) return resolve;
    return constant;

    // return the constant value
    function constant() {
      return promisen.Promise.resolve(task);
    }

    // return a result from the function
    function executable(value) {
      return promisen.Promise.resolve(task.call(this, value));
    }
  }

  function resolve(value) {
    return promisen.Promise.resolve(value);
  }

  function reject(value) {
    return promisen.Promise.reject(value);
  }

  /**
   * creates a task function which runs multiple tasks in order.
   *
   * @class promisen
   * @function waterfall
   * @param tasks {Array|Array-like} list of tasks
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // generate a task function
   * var task = promisen.waterfall([task1, task2, task3,...]);
   *
   * // execute it
   * task(value).then(function(result) {...});
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target, value).then(function(result) {...});
   */

  function waterfall(tasks) {
    if (tasks === null) return promisen(tasks);
    if (tasks == null) return promisen();
    tasks = Array.prototype.map.call(tasks, wrap);
    return composite;

    // composite multiple tasks
    function composite(value) {
      return tasks.reduce(chain.bind(this), resolve(value));
    }

    function wrap(task) {
      return (task != null) && promisen(task);
    }

    // chain tasks
    function chain(promise, func) {
      return func ? promise.then(func.bind(this)) : promise;
    }
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
   * task(value).then(function(array) {...}); // array of results
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target, value).then(function(result) {...});
   */

  function series(tasks) {
    if (tasks == null) return promisen([]);
    var stack = [];
    var result = [];
    tasks = Array.prototype.map.call(tasks, wrap);
    tasks = waterfall(tasks);
    return waterfall([push(stack), tasks, result]);

    // use the first argument only. ignore rest.
    function wrap(task) {
      return waterfall([top(stack), task, push(result)]);
    }
  }

  /**
   * creates a task function which runs multiple tasks in parallel.
   *
   * @class promisen
   * @function parallel
   * @param tasks {Array|Array-like} list of tasks
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // generate a task function
   * var task = promisen.parallel([task1, task2, task3,...]);
   *
   * // execute it
   * task(value).then(function(array) {...}); // array of results
   *
   * // execute it with target object which is passed to every tasks
   * task.call(target, value).then(function(result) {...});
   */

  function parallel(tasks) {
    if (tasks == null) return promisen([]);
    tasks = Array.prototype.map.call(tasks, wrap);
    return all;

    function all(value) {
      var boundTasks = Array.prototype.map.call(tasks, run.bind(this, value));
      return promisen.Promise.all(boundTasks);
    }

    // use the first argument only. ignore rest.
    function wrap(task) {
      return promisen(task);
    }

    function run(value, func) {
      return func.call(this, value);
    }
  }

  /**
   * creates a task function which runs a task assigned by a conditional task.
   *
   * @class promisen
   * @function if
   * @param [condTask] {Boolean|Function|Promise|thenable|*} boolean or task returns boolean
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
   * // conditional task are also available in a waterfall of promisen tasks
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
   * @class promisen
   * @function while
   * @param condTask {Boolean|Function|Promise|thenable|*} boolean or task returns boolean
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
    runTask = waterfall(runTasks);
    var whileTask = IF(condTask, runTask);
    return whileTask;

    function nextTask(value) {
      return whileTask.call(this, value);
    }
  }

  /**
   * creates a task function which runs task repeatedly for each value of array in order.
   *
   * @class promisen
   * @function eachSeries
   * @param arrayTask {Array|Function|Promise|thenable|*} array or task returns an array
   * @param runTask {Function|Promise|thenable|*} task runs repeatedly for each of array values
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var task2 = promisen.eachSeries([1, 2, 3], task1);
   * task2.call(target).then(function() {...});
   */

  function eachSeries(arrayTask, runTask) {
    arrayTask = (arrayTask != null) ? promisen(arrayTask) : promisen();
    var runTasks = Array.prototype.slice.call(arguments, 1);
    runTask = waterfall(runTasks);
    return waterfall([arrayTask, loopTask]);

    // composite multiple tasks
    function loopTask(arrayResults) {
      arrayResults = Array.prototype.map.call(arrayResults, wrap);
      return series(arrayResults).call(this);
    }

    function wrap(value) {
      return waterfall([value, runTask]);
    }
  }

  /**
   * creates a task function which runs task repeatedly for each value of array in parallel.
   *
   * @class promisen
   * @function each
   * @param arrayTask {Array|Function|Promise|thenable|*} array or task returns an array
   * @param runTask {Function|Promise|thenable|*} task runs repeatedly for each of array values
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var task2 = promisen.each([1, 2, 3], task1);
   * task2.call(target).then(function() {...});
   */

  function each(arrayTask, runTask) {
    arrayTask = (arrayTask != null) ? promisen(arrayTask) : promisen();
    var runTasks = Array.prototype.slice.call(arguments, 1);
    runTask = waterfall(runTasks);
    return waterfall([arrayTask, loopTask]);

    // composite multiple tasks
    function loopTask(arrayResults) {
      arrayResults = Array.prototype.map.call(arrayResults, wrap);
      return parallel(arrayResults).call(this);
    }

    function wrap(value) {
      return waterfall([value, runTask]);
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
   * creates a task function which stores a value into the array.
   *
   * @class promisen
   * @function push
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
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
   * creates a task function which fetches the last value on the array.
   *
   * @class promisen
   * @function pop
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
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
   * creates a task function which inspects the last value on the array.
   *
   * @class promisen
   * @function push
   * @param array {Array|Array-like}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
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

  /**
   * creates a task function which inspects value to console.warn() for debug purpose.
   *
   * @class promisen
   * @function warn
   * @param [prefix] {String}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var stack = ["foo", "bar"];
   * var task3 = promisen(task1, promisen.warn("result:"), task2);
   * task3().then(function() {...});
   */

  function warn(prefix) {
    return warnTask;

    function warnTask(value) {
      if ("undefined" !== console && console.warn instanceof Function) {
        if (prefix) {
          console.warn(prefix, value);
        } else {
          console.warn(value);
        }
      }
      return resolve(value);
    }
  }

  /**
   * creates a task function which inspects value to console.log() for debug purpose.
   *
   * @class promisen
   * @function log
   * @param [prefix] {String}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var stack = ["foo", "bar"];
   * var task3 = promisen(task1, promisen.log("result:"), task2);
   * task3().then(function() {...});
   */

  function log(prefix) {
    return logTask;

    function logTask(value) {
      if ("undefined" !== console && console.log instanceof Function) {
        if (prefix) {
          console.log(prefix, value);
        } else {
          console.log(value);
        }
      }
      return resolve(value);
    }
  }

  /**
   * creates a task function which does just sleep for given milliseconds.
   *
   * @class promisen
   * @function wait
   * @param msec {Number}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var sleep = promisen.wait(1000); // 1 sec
   * sleep(value).then(function(value) {...});
   *
   * // similar to below
   * setTimeout(function() {...}, 1000);
   */

  function wait(msec) {
    return waitTask;

    function waitTask(value) {
      var that = this;
      return new promisen.Promise(function(resolve) {
        setTimeout(function() {
          resolve.call(that, value);
        }, msec);
      });
    }
  }

  /**
   * creates a task function which extends the given task with lock feature to run it in serial.
   *
   * @class promisen
   * @function single
   * @param task {Function} task to extend the lock feature
   * @param timeout {Number} 1 minute per default
   * @param interval {Number} 1% length of timeout
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * var serialAjaxTask = promisen.single(ajaxTask, 10000); // 10 seconds
   * serialAjaxTask(req).then(function(res) {...});
   */

  function single(task, timeout, interval) {
    if (!timeout) timeout = 60 * 1000; // 1 minute
    if (!interval) interval = Math.ceil(timeout / 100);
    var mainTask = promisen.waterfall([task, unlockTask]);
    var retryTask = promisen.waterfall([wait(interval), checkTask, singleTask]);
    return singleTask;

    function singleTask(value) {
      if (singleTask.locked) {
        // locked
        return retryTask.call(this, value);
      } else {
        // unlocked
        singleTask.locked = new Date();
        return mainTask.call(this, value);
      }
    }

    function unlockTask(value) {
      delete singleTask.locked;
      return value;
    }

    function checkTask(value) {
      if (!singleTask.locked) return value;
      var duration = new Date() - singleTask.locked;
      if (duration < timeout) return value;

      // force unlock as timeout
      delete singleTask.locked;

      // reject the current job
      var mess = "timeout";
      if (task.name) mess += " for " + task.name;
      mess += ": " + Math.round(duration) + " msec exceeded";
      return reject(Error(mess));
    }
  }

})("undefined" !== typeof module && module, "undefined" !== typeof window && window);
