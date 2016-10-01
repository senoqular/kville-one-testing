# kville-one
Current gen version of Kirupaville - under development.

https://kirupa-racquet-club.github.io/kville-one/

To get involved, simply fork this repo under your account and edit `/src/plot/index.worker.js`.  This JavaScript file (run as a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) will be passed messages through the `onmessage` handler function which can be responded to by calling the `postMessage` function.  Simply by creating a fork, your plot will automatically be recognized and get displayed in the main [community page](https://kirupa-racquet-club.github.io/kville-one/)!

Right now the interface for message posting is under development, but expect more to come soon!
