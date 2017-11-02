const h = require('h');
const fs = require('fs');
const fft = require('../transform');
const css = require('insert-css');
const path = require('path');
const resl = require('resl');
const regl = require('regl');

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
      extensions: ['oes_texture_float']
    })
  }
})

function start (regl, mist) {
  const size = regl._gl.canvas.width;
  const img = regl.texture({data: mist, flipY: true});
  const fbos = [0, 1, 2, 3].map(() => regl.framebuffer({colorType: 'float', radius: size}));

  const apply = require('./apply')(regl);
  const filter = require('./filter')(regl);

  apply(fft({
    size: size,
    input: img,
    ping: fbos[0],
    pong: fbos[1],
    output: fbos[3],
    forward: true
  }));

  apply(fft({
    size: size,
    input: img,
    ping: fbos[0],
    pong: fbos[1],
    output: fbos[3],
    forward: true
  }));

  function draw () {
    let radius = parseFloat(slider.value);
    readout.textContent = radius;

    filter({
      input: fbos[3],
      output: fbos[2],
      size: size,
      radius: radius
    });

    apply(fft({
      size: size,
      input: fbos[2],
      ping: fbos[0],
      pong: fbos[1],
      forward: false
    }));
  }

  slider.addEventListener('input', draw);
  draw();
}
