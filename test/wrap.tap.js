'use strict';

var tap     = require('tap')
  , test    = tap.test
  , sinon   = require('sinon')
  , shimmer = require('../index.js')
  ;

var outsider = 0;
function counter() { return ++outsider; }

var generator = {
  inc : counter
};

test("should wrap safely", function (t) {
  t.plan(6);

  t.equal(counter, generator.inc, "basic function equality testing should work");
  t.doesNotThrow(function () { generator.inc(); });
  t.equal(1, outsider, "calls have side effects");

  var count = 0;
  function wrapper(original) {
    return function () {
      count++;
      var returned = original.apply(this, arguments);
      count++;
      return returned;
    };
  }
  shimmer.wrap(generator, 'inc', wrapper);

  t.doesNotThrow(function () { generator.inc(); });
  t.equal(2, count, "both pre and post increments should have happened");
  t.equal(2, outsider, "original function has still been called");
});

test("wrap called with no arguments", function (t) {
  t.plan(2);

  var mock = sinon.expectation
                  .create('logger')
                  .withArgs("no original function to wrap")
                  .once();
  shimmer({logger : mock});

  t.doesNotThrow(function () {
    shimmer.wrap();
  }, "wrapping with no arguments doesn't throw");

  t.doesNotThrow(function () {
    mock.verify();
  }, "logger was called with the expected message");
});

test("wrap called with module but nothing else", function (t) {
  t.plan(2);

  var mock = sinon.expectation
                  .create('logger')
                  .withArgs("no original function to wrap")
                  .once();
  shimmer({logger : mock});

  t.doesNotThrow(function () {
    shimmer.wrap(generator);
  }, "wrapping with only 1 argument doesn't throw");

  t.doesNotThrow(function () {
    mock.verify();
  }, "logger was called with the expected message");
});

test("wrap called with original but no wrapper", function (t) {
  t.plan(2);

  var mock = sinon.expectation
                  .create('logger')
                  .withArgs("no wrapper function")
                  .once();
  shimmer({logger : mock});

  t.doesNotThrow(function () {
    shimmer.wrap(generator, 'inc');
  }, "wrapping with only original method doesn't throw");

  t.doesNotThrow(function () {
    mock.verify();
  }, "logger was called with the expected message");
});

test("wrap called with non-function original", function (t) {
  t.plan(2);

  var mock = sinon.expectation
                  .create('logger')
                  .withArgs("original object and wrapper must be functions")
                  .once();
  shimmer({logger : mock});

  t.doesNotThrow(function () {
    shimmer.wrap({orange : 'slices'}, 'orange', function () {});
  }, "wrapping non-function original doesn't throw");

  t.doesNotThrow(function () {
    mock.verify();
  }, "logger was called with the expected message");
});

test("wrap called with non-function wrapper", function (t) {
  t.plan(2);

  var mock = sinon.expectation
                  .create('logger')
                  .withArgs("original object and wrapper must be functions")
                  .once();
  shimmer({logger : mock});

  t.doesNotThrow(function () {
    shimmer.wrap({orange : function () {}}, 'orange', 'hamchunx');
  }, "wrapping with non-function wrapper doesn't throw");

  t.doesNotThrow(function () {
    mock.verify();
  }, "logger was called with the expected message");
});