// If you are getting "Uncaught ReferenceError: XXXX is not defined"
// on the client, you need to make sure that you are including that
// resource in the gulp file so it can be compiled into external.js
//
// This will allow those resources to be available on the `window`
//
// Specifically, look at the following gulp tasks:
//
// - minifyplugins:development
// - minifyplugins:production

require('./universal.js');

