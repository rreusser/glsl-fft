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
      splitNormalization: false
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
      splitNormalization: false
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
    splitNormalization: false
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
    splitNormalization: false
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
    splitNormalization: false
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
      splitNormalization: false
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
    splitNormalization: false
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
    splitNormalization: false
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

      var applyFFT = regl({
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

      var drawWavenumber = regl({
        vert: `
          precision mediump float;
          attribute vec2 xy;
          varying vec2 uv;
          void main () {
            uv = 0.5 * xy + 0.5;
            gl_Position = vec4(xy, 0, 1);
          }
        `,
        frag: glsl(`
          precision highp float;
          #pragma glslify: wavenumber = require(../wavenumber)
          varying vec2 uv;
          uniform vec2 resolution;

          void main () {
            gl_FragColor = vec4(wavenumber(resolution), 0, 0);
          }
        `),
        uniforms: {resolution: regl.prop('resolution')},
        attributes: {xy: [-4, -4, 4, -4, 0, 4]},
        framebuffer: regl.prop('output'),
        depth: {enable: false},
        count: 3
      });

      function compare (actual, expected, tol) {
        for (var i = 0; i < expected.length; i++) {
          if (!almostEqual(expected[i], actual[i], tol, tol)) {
            t.notOk(i + ': ' + actual[i] + ' (actual) !~ ' + expected[i] + ' (expected) (tol=' + tol + ')');
            return false;
          }
        }
        return true;
      }

      function fftfreq (i, n, dx) {
        return ((i < Math.floor((n + 1) / 2)) ? i / (n * dx) : -(n - i) / (n * dx)) * 2 * Math.PI;
      }

      function testWavenumber (width, height) {
        var expected = new Array(width * height * 4).fill(0);
        for (var i = 0; i < width; i++) {
          for (var j = 0; j < height; j++) {
            var idx = 4 * (i * height + j);
            expected[idx] = fftfreq(i, width, 1.0);
            expected[idx + 1] = fftfreq(j, height, 1.0);
            expected[idx + 2] = 0.0;
            expected[idx + 3] = 0.0;
          }
        }

        var ndExpected = ndarray(expected, [width, height, 4]);
        //console.log('kx = \n' + show(ndExpected.pick(null, null, 0)) + '\n');
        //console.log('ky = \n' + show(ndExpected.pick(null, null, 1)) + '\n');

        var fbo = regl.framebuffer({
          colorType: 'float',
          colorFormat: 'rgba',
          width: width,
          height: height
        });

        drawWavenumber({
          resolution: [1 / width, 1 / height],
          output: fbo
        });

        var ndOut;
        fbo.use(function () {
          var data = regl.read();
          ndOut = ndarray(data, [height, width, 4]).transpose(1, 0);

          //console.log('kx:\n' + show(ndOut.pick(null, null, 0)) + '\n');
          //console.log('ky:\n' + show(ndOut.pick(null, null, 1)) + '\n');

          var clone = pool.clone(ndOut)
          t.ok(compare(clone.data, ndExpected.data, 1e-4), 'wavenumber: ' + width + ' x ' + height);
          pool.free(clone);
        });

        fbo.destroy();
      }

      function testFFT (direction, width, height, tol) {
        var input = new Array(width * height * 4).fill(0).map(random);

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
          splitNormalization: false,
          width: width,
          height: height,
          input: fbos[0],
          ping: fbos[0],
          pong: fbos[1],
          output: fbos[2],
          forward: direction > 0 ? true : false
        });

        applyFFT(fft);

        var ndOut;
        fbos[2].use(function () {
          var data = regl.read();
          ndOut = ndarray(data, [height, width, 2, 2]).transpose(1, 0);

          // Flatten this ndarray so we can compare internal data:
          var clone = pool.clone(ndOut)
          t.ok(compare(clone.data, A.data, tol), (direction > 0 ? 'forward ' : 'inverse ') + width + ' x ' + height);
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

      testFFT(1, 2, 2, 1e-5);
      testFFT(1, 4, 2, 1e-5);
      testFFT(1, 8, 2, 1e-4);
      testFFT(1, 16, 2, 1e-4);
      testFFT(1, 32, 2, 1e-3);

      testFFT(1, 1, 8, 1e-5);
      testFFT(1, 2, 8, 1e-5);
      testFFT(1, 4, 8, 1e-4);
      testFFT(1, 8, 8, 1e-4);
      testFFT(1, 16, 8, 1e-4);
      testFFT(1, 32, 8, 1e-3);

      testFFT(-1, 1, 8, 1e-5);
      testFFT(-1, 2, 8, 1e-5);
      testFFT(-1, 4, 8, 1e-5);
      testFFT(-1, 8, 8, 1e-4);
      testFFT(-1, 16, 8, 1e-4);
      testFFT(-1, 32, 8, 1e-3);

      testFFT(1, 1, 8, 1e-5);
      testFFT(1, 2, 8, 1e-5);
      testFFT(1, 4, 8, 1e-5);
      testFFT(1, 8, 8, 1e-4);
      testFFT(1, 16, 8, 1e-4);
      testFFT(1, 32, 8, 1e-3);

      testFFT(-1, 1, 8, 1e-5);
      testFFT(-1, 2, 8, 1e-5);
      testFFT(-1, 4, 8, 1e-5);
      testFFT(-1, 8, 8, 1e-4);
      testFFT(-1, 16, 8, 1e-4);
      testFFT(-1, 32, 8, 1e-3);

      testFFT(1, 32, 64, 1e-2);
      testFFT(-1, 32, 64, 1e-4);
      testFFT(1, 64, 32, 1e-2);
      testFFT(-1, 64, 32, 1e-5);
      testFFT(1, 64, 64, 1e-2);
      testFFT(-1, 64, 64, 1e-5);


      for (i = 0; i < 6; i++) {
        for (j = 0; j < 6; j++) {
          testWavenumber(Math.pow(2, i), Math.pow(2, j));
        }
      }

      testWavenumber(128, 128);

      regl.destroy();

      t.end();
    }
  });
});
