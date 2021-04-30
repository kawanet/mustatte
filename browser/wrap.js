var Mustatte = (function(load, main) {
  var defined = {};
  if ("undefined" != typeof exports) defined[main] = exports;
  var require = defined.require = function(name) {
    return defined[name]
  };
  load(function(name, deps, fn) {
    defined.exports = defined[name] || (defined[name] = {});
    fn.apply(null, deps.map(require));
  });
  return defined[main];
})(function(define) {
  // AMD
}, "index"); // END
