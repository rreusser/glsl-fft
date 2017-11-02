var test = require('tape');
var transform = require('../transform');

test('forward fft', function (t) {
  var fft = transform({
    resolution: 8,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'd',
    forward: true
  });

  t.deepEqual(fft, [
    { forward: true, input: 'a', output: 'b', normalize: false, horizontal: true, subtransformSize: 2, resolution: 32 },
    { forward: true, input: 'b', output: 'c', normalize: false, horizontal: true, subtransformSize: 4, resolution: 32 },
    { forward: true, input: 'c', output: 'b', normalize: false, horizontal: true, subtransformSize: 8, resolution: 32 },
    { forward: true, input: 'b', output: 'c', normalize: false, horizontal: true, subtransformSize: 16, resolution: 32 },
    { forward: true, input: 'c', output: 'b', normalize: false, horizontal: true, subtransformSize: 32, resolution: 32 },
    { forward: true, input: 'b', output: 'c', normalize: false, horizontal: false, subtransformSize: 2, resolution: 32 },
    { forward: true, input: 'c', output: 'b', normalize: false, horizontal: false, subtransformSize: 4, resolution: 32 },
    { forward: true, input: 'b', output: 'c', normalize: false, horizontal: false, subtransformSize: 8, resolution: 32 },
    { forward: true, input: 'c', output: 'b', normalize: false, horizontal: false, subtransformSize: 16, resolution: 32 },
    { forward: true, input: 'b', output: 'd', normalize: false, horizontal: false, subtransformSize: 32, resolution: 32 }
  ]);

  t.end();
});

test('inverse fft', function (t) {
  var fft = transform({
    resolution: 32,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'd',
    forward: false
  });

  t.deepEqual(fft, [
    { forward: false, input: 'a', output: 'b', normalize: true, horizontal: true, subtransformSize: 2, resolution: 32 },
    { forward: false, input: 'b', output: 'c', normalize: false, horizontal: true, subtransformSize: 4, resolution: 32 },
    { forward: false, input: 'c', output: 'b', normalize: false, horizontal: true, subtransformSize: 8, resolution: 32 },
    { forward: false, input: 'b', output: 'c', normalize: false, horizontal: true, subtransformSize: 16, resolution: 32 },
    { forward: false, input: 'c', output: 'b', normalize: false, horizontal: true, subtransformSize: 32, resolution: 32 },
    { forward: false, input: 'b', output: 'c', normalize: false, horizontal: false, subtransformSize: 2, resolution: 32 },
    { forward: false, input: 'c', output: 'b', normalize: false, horizontal: false, subtransformSize: 4, resolution: 32 },
    { forward: false, input: 'b', output: 'c', normalize: false, horizontal: false, subtransformSize: 8, resolution: 32 },
    { forward: false, input: 'c', output: 'b', normalize: false, horizontal: false, subtransformSize: 16, resolution: 32 },
    { forward: false, input: 'b', output: 'd', normalize: false, horizontal: false, subtransformSize: 32, resolution: 32 }
  ]);

  t.end();
});
