module.exports = function (opts) {
  opts = opts || {};
  opts.forward = opts.forward === undefined ? true : opts.forward;

  var passes = [];
  var iterations = Math.round(Math.log(opts.resolution) / Math.log(2)) * 2;

  for (var i = 0; i < iterations; i += 1) {
    var uniforms = {};

    if (i === 0) {
      uniforms.input = opts.input;
      uniforms.output = opts.ping;
    } else if (i === iterations - 1) {
      uniforms.input = opts.ping;
      uniforms.output = opts.output;
    } else if (i % 2 === 1) {
      uniforms.input = opts.ping;
      uniforms.output = opts.pong;
    } else {
      uniforms.input = opts.pong;
      uniforms.output = opts.ping;
    }

    uniforms.forward = !!opts.forward;
    uniforms.normalize = i === 0 && !opts.forward;
    uniforms.horizontal = i < iterations / 2;
    uniforms.subtransformSize = Math.pow(2, (i % (iterations / 2)) + 1);
    uniforms.resolution = opts.resolution;

    passes.push(uniforms);
  }

  return passes;
}
