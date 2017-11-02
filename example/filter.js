const glsl = require('glslify');

module.exports = function (regl) {
  return regl({
    vert: `
      precision mediump float;
      varying vec2 uv;
      attribute vec2 xy;
      void main () {
        uv = 0.5 * xy + 0.5;
        gl_Position = vec4(xy, 0, 1);
      }
    `,
    frag: glsl(`
      precision highp float;

      #pragma glslify: wavenumber = require(../wavenumber.glsl)

      varying vec2 uv;
      uniform sampler2D src;
      uniform float size;
      uniform float radius;

      void main () {
        vec4 col = texture2D(src, uv);
        vec2 kxy = wavenumber(size);

        float r = radius / size;
        gl_FragColor = col * exp(-dot(kxy, kxy) * r * r);
      }
    `),
    uniforms: {
      size: regl.prop('size'),
      radius: regl.prop('radius'),
      src: regl.prop('input'),
    },
    attributes: {xy: [-4, -4, 4, -4, 0, 4]},
    framebuffer: regl.prop('output'),
    depth: {enable: false},
    count: 3
  });
};
