const glsl = require('glslify');

module.exports = function (regl) {
  return regl({
    vert: `
      precision mediump float;
      attribute vec2 xy;
      void main () {
        gl_Position = vec4(xy, 0, 1);
      }
    `,
    frag: glsl(`
      precision highp float;

      #pragma glslify: fft = require(../fft.glsl)

      uniform sampler2D src;
      uniform float resolution, subtransformSize;
      uniform bool horizontal, forward, normalize;

      void main () {
        gl_FragColor = fft(src, resolution, subtransformSize, horizontal, forward, normalize);
      }
    `),
    uniforms: {
      resolution: regl.prop('resolution'),
      forward: regl.prop('forward'),
      subtransformSize: regl.prop('subtransformSize'),
      horizontal: regl.prop('horizontal'),
      normalize: regl.prop('normalize'),
      src: regl.prop('input'),
    },
    attributes: {xy: [-4, -4, 4, -4, 0, 4]},
    framebuffer: regl.prop('output'),
    depth: {enable: false},
    count: 3
  });
};
