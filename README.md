# promisen.js

promisen.js creates promise-returning functions. ready for ES6 Promise.

### Usage

```js
var promisen = require("promisen");

var joinedTask = promisen(func, promise, thenable, object);

joinedTask(initialValue).then(function(result) {...});
```

### For Node.js

```sh
npm install --save promisen
```

### For Browser

Minified version of promisen.min.js does NOT include es6-promise.min.js.
It is required for browsers which does NOT implement Promise. 

```html
<script src="https://raw.githubusercontent.com/jakearchibald/es6-promise/master/dist/es6-promise.min.js"></script>
<script src="https://raw.githubusercontent.com/kawanet/promisen/master/dist/promisen.min.js"></script>
```

### Repository

- https://github.com/kawanet/promisen

### Documentation

- http://kawanet.github.io/promisen/module-promisen.html

### See Also

- https://www.npmjs.com/package/es6-promise
- https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise

### License

The MIT License (MIT)

Copyright (c) 2015 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
