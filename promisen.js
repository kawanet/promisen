/**
 * promisen.js - generates function works easy with Promise.
 *
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
  promisen.createCounter = createCounter;
  promisen.createStack = createStack;

  /**
   * It wraps a plain old function as a promise task function which returns a promise (thenable) object.
   * Following types of tasks are available as well as functions.
   *
   * * function
   * * promise object
   * * thenable object
   * * any other objects
   * * constant value
   * * multiple values of above
   *
   * @param task {Function|Promise|thenable|*}
   * @returns {Function}
   * @example
   * var promisen = require("promisen");
   *
   * // wrap a single function
   * var wrapped = promisen(function(value) {...});
   * wrapped(value).then(function(result) {...});
   *
   * // composite multiple tasks
   * var joined = promisen(func, promise, thenable, object);
   * joined(value).then(function(result){...});
   *
   * // composite multiple tasks bound with the target
   * var bound = promisen.call(target, func1, func2, func3);
   * bound(value).then(function(result){...});
   */

  function promisen(task) {
    var Promise = promisen.Promise;
    if (arguments.length > 1) return series(arguments);
    if (task instanceof Function) return executable;
    if (task == null) return through;
    if (arguments.length) return constant;
    return through;

    // return the constant value
    function constant() {
      return Promise.resolve(task);
    }

    // return a result from the function
    function executable(value) {
      return Promise.resolve(task.call(this, value));
    }

    // through the value
    function through(value) {
      return Promise.resolve(value);
    }
  }

  /**
   * creates a task function which runs multiple tasks in order.
   *
   * @name promisen.series
   * @param tasks {Array|Array-like} list of tasks
   * @returns {Function}
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
   * creates a task which runs a task assigned by a conditional task
   *
   * @name promisen.createConditional
   * @param [condTask] {Function|Promise|thenable|*} condition task
   * @param [trueTask] {Function|Promise|thenable|*} task runs when true
   * @param [falseTask] {Function|Promise|thenable|*} task runs when false
   * @returns {Function}
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
   * @name promisen.createCounter
   * @param [count] {Number} default count: 0
   * @param [step] {Number} default step: +1
   * @returns {Counter}
   * @example
   * var createCounter = require("promisen").createCounter;
   *
   * var counter = createCounter(123);
   * console.log("count: " + counter); // => count: 123
   * counter.incr(); // increment
   * console.log("count: " + counter); // => count: 124
   * counter.decr(); // decrement
   * console.log("count: " + counter); // => count: 123
   */

  function createCounter(count, step) {
    count = count - 0 || 0;
    step = step - 0 || 1;

    var resolve = promisen();
    var holder = [count];
    holder.incr = increment;
    holder.decr = decrement;
    holder.get = getter;
    holder.set = setter;
    return holder;

    /**
     * increments the counter
     *
     * @name Counter.prototype.incr
     * @param value {*} through to return
     * @returns {Promise}
     */

    function increment(value) {
      holder[0] += step;
      return resolve(value);
    }

    /**
     * decrements the counter
     *
     * @name Counter.prototype.decr
     * @param value {*} through to return
     * @returns {Promise}
     */

    function decrement(value) {
      holder[0] -= step;
      return resolve(value);
    }

    /**
     * retrieve the number from the counter
     *
     * @name Counter.prototype.get
     * @returns {Promise}
     */

    function getter() {
      return resolve(holder[0]);
    }

    /**
     * copy the number to the counter
     *
     * @name Counter.prototype.set
     * @param value {Number} number to set
     * @returns {Promise}
     */

    function setter(value) {
      holder[0] = value - 0 || 0;
      return resolve(value);
    }
  }

  /**
   * creates a stack which has push() and pop() methods.
   *
   * @name promisen.createCounter
   * @param [stack] {Array|Array-like} default: []
   * @returns {Stack}
   */

  function createStack(stack) {
    if (!stack) stack = [];
    var resolve = promisen();

    /**
     * copy the value to stack.
     *
     * @name Stack.prototype.push
     * @param value {*} value to push
     * @returns {Promise}
     */

    stack.push = function(value) {
      Array.prototype.push.call(stack, value); // copy
      return resolve(value); // through
    };

    /**
     * retrieves the last value from stack.
     *
     * @name Stack.prototype.pop
     * @returns {Promise}
     */

    stack.pop = function() {
      var value = Array.prototype.pop.call(stack);
      return resolve(value);
    };

    return stack;
  }

})("undefined" !== typeof module && module, "undefined" !== typeof window && window);
