const h = require('h');
const fs = require('fs');
const fft = require('../');
const css = require('insert-css');
const path = require('path');
const resl = require('resl');
const regl = require('regl');
const glsl = require('glslify');
const mobile = require('is-mobile');

const slider = h('input', {type: 'range', min: 0, max: 512, step: 1, id: 'radius'});
const readout = h('span', {id: 'readout'});
const controls = h('div', [h('label', 'Radius:', {for: 'radius'}), slider, readout]);
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
      uniform float width, height, radius;

      void main () {
        vec4 col = texture2D(src, uv);
        vec2 kxy = wavenumber(width, height);
        gl_FragColor = col * exp(-dot(kxy, kxy) * radius * radius);
      }
    `),
    uniforms: {
      width: regl.prop('width'),
      height: regl.prop('height'),
      radius: regl.prop('radius'),
      src: regl.prop('input'),
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
    readout.textContent = slider.value;

    filter({
      input: fbos[0],
      output: fbos[1],
      width: width,
      height: height,
      radius: parseFloat(slider.value)
    });

    apply(inverse);
  }

  slider.addEventListener('input', draw);
  draw();
}
