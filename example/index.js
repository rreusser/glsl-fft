const h = require('h');
const fs = require('fs');
const fft = require('../');
const css = require('insert-css');
const path = require('path');
const resl = require('resl');
const regl = require('regl');
const glsl = require('glslify');
const mobile = require('is-mobile');

const radiusSlider = h('input', {type: 'range', min: 0, max: 50, step: 0.1, id: 'radius', value: 10});
const angleSlider = h('input', {type: 'range', min: 0, max: 180, step: 1, id: 'angle', value: 0});
const radiusReadout = h('span', {class: 'readout'});
const angleReadout = h('span', {class: 'readout'});
const controls = h('div', [
  h('div', [h('label', 'Radius:', {for: 'radius'}), radiusSlider, radiusReadout]),
  h('div', [h('label', 'Angle:', {for: 'angle'}), angleSlider, angleReadout]),
]);
const root = h('div', {id: 'root'});
document.body.appendChild(root);
document.body.appendChild(controls);

css(fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8'));

resl({
  manifest: {mist: {type: 'image', src: 'mist.jpg'}},
  onDone: ({mist}) => {
    regl({
      pixelRatio: 1,
      container: root,
      attributes: {antialias: false},
      onDone: require('fail-nicely')(regl => start(regl, mist)),
      optionalExtensions: ['oes_texture_float'],
      extensions: ['oes_texture_half_float']
    })
  }
})

function start (regl, mist) {
  const width = regl._gl.canvas.width;
  const height = regl._gl.canvas.height;
  const img = regl.texture({data: mist, flipY: true});
  const type = (regl.hasExtension('oes_texture_float') && !mobile) ? 'float' : 'half float';
  const fbos = [0, 1, 2].map(() => regl.framebuffer({colorType: type, width: width, height: height}));

  const apply = regl({
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
        gl_FragColor = fft(src, resolution, subtransformSize, horizontal, forward, normalization);
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

  const filter = regl({
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
      #pragma glslify: wavenumber = require(../wavenumber)
      varying vec2 uv;
      uniform sampler2D src;
      uniform vec2 resolution, e1;
      uniform float radius;

      void main () {
        vec4 col = texture2D(src, uv);
        vec2 kxy = wavenumber(resolution);
        float k1 = dot(e1, kxy) * radius;
        gl_FragColor = col * exp(-k1 * k1 * 0.5);
      }
    `),
    uniforms: {
      resolution: regl.prop('resolution'),
      radius: regl.prop('radius'),
      src: regl.prop('input'),
      e1: regl.prop('e1'),
    },
    attributes: {xy: [-4, -4, 4, -4, 0, 4]},
    framebuffer: regl.prop('output'),
    depth: {enable: false},
    count: 3
  });

  const forward = fft({
    width: width,
    height: height,
    input: img,
    ping: fbos[0],
    pong: fbos[1],
    output: fbos[0],
    forward: true
  });

  const inverse = fft({
    width: width,
    height: height,
    input: fbos[1],
    ping: fbos[1],
    pong: fbos[2],
    forward: false
  });

  apply(forward);

  function draw () {
    radiusReadout.textContent = radiusSlider.value;
    angleReadout.textContent = angleSlider.value;
    var theta = parseFloat(angleSlider.value) * Math.PI / 180.0;

    filter({
      input: fbos[0],
      output: fbos[1],
      resolution: [1 / width, 1 / height],
      radius: parseFloat(radiusSlider.value),
      e1: [Math.cos(theta), Math.sin(theta)]
    });

    apply(inverse);
  }

  radiusSlider.addEventListener('input', draw);
  angleSlider.addEventListener('input', draw);
  draw();
}
