var isPOT = require('is-power-of-two');

module.exports = function (opts) {
  opts = opts || {};
  opts.forward = opts.forward === undefined ? true : opts.forward;

  if (!isPOT(opts.size)) {
    throw new Error('size msut be power of two');
  }

  var ping = opts.ping;
  if (opts.input === opts.pong) {
    ping = opts.pong;
  }
  var pong = ping === opts.ping ? opts.pong : opts.ping;

  var passes = [];
  var iterations = Math.round(Math.log(opts.size) / Math.log(2)) * 2;

  for (var i = 0; i < iterations; i += 1) {
    var uniforms = {input: ping, output: pong};

    if (i === 0) {
      uniforms.input = opts.input;
    } else if (i === iterations - 1) {
      uniforms.output = opts.output;
    }

    uniforms.forward = !!opts.forward;
    uniforms.normalize = i === 0 && !opts.forward;
    uniforms.horizontal = i < iterations / 2;
    uniforms.subtransformSize = Math.pow(2, (i % (iterations / 2)) + 1);
    uniforms.size = opts.size;

    passes.push(uniforms);

    var tmp = ping;
    ping = pong;
    pong = tmp;
  }

  return passes;
}
