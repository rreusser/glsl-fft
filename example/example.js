var fft = require('../');

console.log(fft({
  width: 4,
  height: 2,
  input: 'a',
  ping: 'b',
  pong: 'c',
  output: 'd',
  forward: true,
  normalization: 'inverse'
}));
