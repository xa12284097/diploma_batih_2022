# debug-wrapper

 debug-wrapper goal is to avoid logging to stderr by default. 
 Usage you can use it

 ``
 yarn add debugjs-wrapper
 ``
 
 in the code:
 ```js
const {debug, error, info } = require('debugjs-wrapper').all('namespace:subnamespace');

debug('debug'); //goes to stdout
error('error'); //goes to stderr
info('info'); //goes to stdout
```