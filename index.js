var isPOT = require('is-power-of-two');

function checkPOT (label, value) {
  if (!isPOT(value)) {
    throw new Error(label + ' must be a power of two. got ' + label + ' = ' + value);
  }
}

module.exports = function (opts) {
  var i, ping, pong, uniforms, tmp, width, height;

  opts = opts || {};
  opts.forward = opts.forward === undefined ? true : opts.forward;
  opts.normalization = opts.normalization === undefined ? 'split' : opts.normalization;

  function swap () {
    tmp = ping;
    ping = pong;
    pong = tmp;
  }

  if (opts.size !== undefined) {
    width = height = opts.size;
    checkPOT('size', width);
  } else if (opts.width !== undefined && opts.height !== undefined) {
    width = opts.width;
    height = opts.height;
    checkPOT('width', width);
    checkPOT('height', width);
  } else {
    throw new Error('either size or both width and height must provided.');
  }

  // Swap to avoid collisions with the input:
  ping = opts.ping;
  if (opts.input === opts.pong) {
    ping = opts.pong;
  }
  pong = ping === opts.ping ? opts.pong : opts.ping;

  var passes = [];
  var xIterations = Math.round(Math.log(width) / Math.log(2));
  var yIterations = Math.round(Math.log(height) / Math.log(2));
  var iterations = xIterations + yIterations;

  // Swap to avoid collisions with output:
  if (opts.output === ((iterations % 2 === 0) ? pong : ping)) {
    swap();
  }

  // If we've avoiding collision with output creates an input collision,
  // then you'll just have to rework your framebuffers and try again.
  if (opts.input === pong) {
    throw new Error([
      'not enough framebuffers to compute without copying data. You may perform',
      'the computation with only two framebuffers, but the output must equal',
      'the input when an even number of iterations are required.'
    ].join(' '));
  }

  for (i = 0; i < iterations; i++) {
    uniforms = {
      input: ping,
      output: pong,
      horizontal: i < xIterations,
      forward: !!opts.forward,
      resolution: [1.0 / width, 1.0 / height]
    };

    if (i === 0) {
      uniforms.input = opts.input;
    } else if (i === iterations - 1) {
      uniforms.output = opts.output;
    }

    if (i === 0) {
      if (opts.normalization === 'split') {
        uniforms.normalization = 1.0 / Math.sqrt(width * height);
      } else if (!opts.forward) {
        uniforms.normalization = 1.0 / width / height;
      } else {
        uniforms.normalization = 1;
      }
    } else {
      uniforms.normalization = 1;
    }

    uniforms.subtransformSize = Math.pow(2, (uniforms.horizontal ? i : (i - xIterations)) + 1);

    passes.push(uniforms);

    swap();
  }

  return passes;
}
