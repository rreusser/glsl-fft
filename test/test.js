var test = require('tape');
var regl = require('regl');
var transform = require('../');
var iota = require('iota-array');
var glsl = require('glslify');
var show = require('ndarray-show');
var ndarray = require('ndarray');
var ndFft = require('ndarray-fft');
var pool = require('ndarray-scratch');
var almostEqual = require('almost-equal');

var seed = 1;
function random () {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

test('throws if size is not a power of two', function (t) {
  t.throws(function () {
    transform({
      size: 9,
      input: 'a',
      ping: 'b',
      pong: 'c',
      output: 'd',
      forward: true,
      normalization: 'inverse'
    });
  }, /must be a power of two/);

  t.end();
});

test('throws neither size nor height+width are provided', function (t) {
  t.throws(function () {
    transform({
      input: 'a',
      ping: 'b',
      pong: 'c',
      output: 'd',
      forward: true,
      normalization: 'inverse',
    });
  }, /either size or both width and height/);

  t.end();
});

test('forward fft', function (t) {
  var fft = transform({
    size: 32,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'd',
    forward: true,
    normalization: 'inverse'
  });

  t.deepEqual(fft, [
    { forward: true, input: 'a', output: 'c', normalization: 1, horizontal: true, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 32, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'd', normalization: 1, horizontal: false, subtransformSize: 32, resolution: [0.03125, 0.03125]}
  ]);

  t.end();
});

test('forward fft avoids input framebuffer collisions', function (t) {
  var fft = transform({
    size: 32,
    input: 'a',
    ping: 'b',
    pong: 'a',
    output: 'c',
    forward: true,
    normalization: 'inverse'
  });

  t.deepEqual(fft, [
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: true, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'a', normalization: 1, horizontal: true, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: true, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'a', normalization: 1, horizontal: true, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: true, subtransformSize: 32, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'a', normalization: 1, horizontal: false, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: false, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'a', normalization: 1, horizontal: false, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: false, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 32, resolution: [0.03125, 0.03125]}
  ]);

  t.end();
});

test('forward fft avoids output framebuffer collisions', function (t) {
  var fft = transform({
    size: 32,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'c',
    forward: true,
    normalization: 'inverse'
  });

  t.deepEqual(fft, [
    { forward: true, input: 'a', output: 'b', normalization: 1, horizontal: true, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 32, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 32, resolution: [0.03125, 0.03125]}
  ]);

  t.end();
});

test('detects input+output framebuffer collisions', function (t) {
  t.throws(function () {
    transform({
      size: 32,
      input: 'a',
      ping: 'b',
      pong: 'a',
      output: 'b',
      forward: true,
      normalization: 'inverse'
    });
  }, /not enough framebuffers to compute/);

  t.end();
});

test('non-square forward fft', function (t) {
  var fft = transform({
    width: 16,
    height: 8,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'd',
    forward: true,
    normalization: 'inverse'
  });

  t.deepEqual(fft, [
    { forward: true, input: 'a', output: 'c', normalization: 1, horizontal: true, subtransformSize: 2, resolution: [0.0625, 0.125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 4, resolution: [0.0625, 0.125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 8, resolution: [0.0625, 0.125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 16, resolution: [0.0625, 0.125]},
    { forward: true, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 2, resolution: [0.0625, 0.125]},
    { forward: true, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 4, resolution: [0.0625, 0.125]},
    { forward: true, input: 'b', output: 'd', normalization: 1, horizontal: false, subtransformSize: 8, resolution: [0.0625, 0.125]}
  ]);

  t.end();
});

test('inverse fft', function (t) {
  var fft = transform({
    size: 32,
    input: 'a',
    ping: 'b',
    pong: 'c',
    output: 'd',
    forward: false,
    normalization: 'inverse'
  });

  t.deepEqual(fft, [
    { forward: false, input: 'a', output: 'c', normalization: 0.0009765625, horizontal: true, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'c', output: 'b', normalization: 1, horizontal: true, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'b', output: 'c', normalization: 1, horizontal: true, subtransformSize: 32, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 2, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 4, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'c', output: 'b', normalization: 1, horizontal: false, subtransformSize: 8, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'b', output: 'c', normalization: 1, horizontal: false, subtransformSize: 16, resolution: [0.03125, 0.03125]},
    { forward: false, input: 'c', output: 'd', normalization: 1, horizontal: false, subtransformSize: 32, resolution: [0.03125, 0.03125]}
  ]);

  t.end();
});

test('regl', function (t) {
  var canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;

  regl({
    canvas: canvas,
    extensions: ['oes_texture_float'],
    onDone: function (err, regl) {
      if (err) {
        t.notOk('fail');
        t.end();
      }

      var apply = regl({
        vert: `
          precision mediump float;
          attribute vec2 xy;
          void main () {
            gl_Position = vec4(xy, 0, 1);
          }
        `,
        frag: glsl(`
          precision highp float;
          #pragma glslify: fft = require(../)
          uniform sampler2D src;
          uniform vec2 resolution;
          uniform float subtransformSize, normalization;
          uniform bool horizontal, forward;

          void main () {
            gl_FragColor = fft(
              src,
              resolution,
              subtransformSize,
              horizontal,
              forward,
              normalization
            );
          }
        `),
        uniforms: {
          resolution: regl.prop('resolution'),
          forward: regl.prop('forward'),
          subtransformSize: regl.prop('subtransformSize'),
          horizontal: regl.prop('horizontal'),
          normalization: regl.prop('normalization'),
          src: regl.prop('input'),
        },
        attributes: {xy: [-4, -4, 4, -4, 0, 4]},
        framebuffer: regl.prop('output'),
        depth: {enable: false},
        count: 3
      });

      function compare (A, B, tol) {
        for (var i = 0; i < A.length; i++) {
          if (!almostEqual(A[i], B[i], tol, tol)) {
            t.notOk(i + ': ' + A[i] + ' ~ ' + B[i] + ' (' + tol + ')');
            return false;
          }
        }
        return true;
      }

      function test (direction, width, height, tol) {
        var input = new Array(width * height * 4).fill(0).map(i => random())

        var A = ndarray(new Float32Array(input), [width, height, 2, 2]);

        // console.log('Ar = \n' + show(A.pick(null, null, 0, 0)));
        // console.log('Ar = \n' + show(A.pick(null, null, 0, 1)));

        ndFft(direction, A.pick(null, null, 0, 0), A.pick(null, null, 0, 1));
        ndFft(direction, A.pick(null, null, 1, 0), A.pick(null, null, 1, 1));

        var fbos = [0, 1, 2].map(function () {
          return regl.framebuffer({
            color: regl.texture({
              type: 'float',
              format: 'rgba',
              data: ndarray(input, [width, height, 4]),
              width: width,
              height: height
            })
          })
        });

        var fft = transform({
          normalization: 'inverse',
          width: width,
          height: height,
          input: fbos[0],
          ping: fbos[0],
          pong: fbos[1],
          output: fbos[2],
          forward: direction > 0 ? true : false
        });

        apply(fft);

        var ndOut;
        fbos[2].use(function () {
          var data = regl.read();
          ndOut = ndarray(data, [height, width, 2, 2]).transpose(1, 0);

          // Flatten this ndarray so we can compare internal data:
          var clone = pool.clone(ndOut)
          t.ok(compare(A.data, clone.data, tol), (direction > 0 ? 'forward ' : 'reverse ') + width + ' x ' + height);
          pool.free(clone);
        });

        // console.log('Ahr (expected) = \n' + show(A.pick(null, null, 0, 0)) + '\n');
        // console.log('Ahr = \n' + show(ndOut.pick(null, null, 0, 0)) + '\n\n');
        // console.log('Ahi (expected) = \n' + show(A.pick(null, null, 0, 1)) + '\n');
        // console.log('Ahi = \n' + show(ndOut.pick(null, null, 0, 1)) + '\n');

        fbos.forEach(function (fbo) {
          fbo.destroy();
        });
      }

      test(1, 2, 2, 1e-5);
      test(1, 4, 2, 1e-5);
      test(1, 8, 2, 1e-4);
      test(1, 16, 2, 1e-4);
      test(1, 32, 2, 1e-3);

      test(1, 1, 8, 1e-5);
      test(1, 2, 8, 1e-5);
      test(1, 4, 8, 1e-4);
      test(1, 8, 8, 1e-4);
      test(1, 16, 8, 1e-4);
      test(1, 32, 8, 1e-3);

      test(-1, 1, 8, 1e-5);
      test(-1, 2, 8, 1e-5);
      test(-1, 4, 8, 1e-5);
      test(-1, 8, 8, 1e-4);
      test(-1, 16, 8, 1e-4);
      test(-1, 32, 8, 1e-3);

      test(1, 1, 8, 1e-5);
      test(1, 2, 8, 1e-5);
      test(1, 4, 8, 1e-5);
      test(1, 8, 8, 1e-4);
      test(1, 16, 8, 1e-4);
      test(1, 32, 8, 1e-3);

      test(-1, 1, 8, 1e-5);
      test(-1, 2, 8, 1e-5);
      test(-1, 4, 8, 1e-5);
      test(-1, 8, 8, 1e-4);
      test(-1, 16, 8, 1e-4);
      test(-1, 32, 8, 1e-3);

      test(1, 32, 64, 1e-2);
      test(-1, 32, 64, 1e-4);
      test(1, 64, 32, 1e-2);
      test(-1, 64, 32, 1e-5);
      test(1, 64, 64, 1e-2);
      test(-1, 64, 64, 1e-5);

      regl.destroy();

      t.end();
    }
  });
});
