# glsl-fft

> GLSL setup for performing a [Fast Fourier Transform][fft]

This module does not interface with WebGL or have WebGL-specific peer dependencies. It only performs the setup work required to invoke the provided fragment shader that performs the Fourier transform.

## Installation

Will be published to npm after a bit more testing.

## Example

The code below shows usage of the basic JavaScript API. The [example](./example/index.js) is perhaps more illustrative since it shows a fully worked example for a Gaussian blur. Note in particular the the return value of the JavaScript API is particularly suited for the way [regl][regl] performs multiple draw calls with a single function call.

```javascript
var forwardTransform = fft({
  size: 8,
  input: 'a',
  ping: 'b',
  pong: 'c',
  output: 'd',
  forward: true
});

// => [{
//   input: 'a',
//   output: 'b',
//   forward: true,
//   normalize: false,
//   horizontal: true,
//   subtransformSize: 2,
//   size: 8
// }, {
//   input: 'b',
//   output: 'c',
//   forward: true,
//   normalize: false,
//   horizontal: true,
//   subtransformSize: 4,
//   size: 8
// }, {
//   input: 'c',
//   output: 'b',
//   forward: true,
//   normalize: false,
//   horizontal: true,
//   subtransformSize: 8,
//   size: 8
// }, {
//   input: 'b',
//   output: 'c',
//   forward: true,
//   normalize: false,
//   horizontal: false,
//   subtransformSize: 2,
//   size: 8
// }, {
//   input: 'c',
//   output: 'b',
//   forward: true,
//   normalize: false,
//   horizontal: false,
//   subtransformSize: 4,
//   size: 8
// }, {
//   input: 'b',
//   output: 'd',
//   forward: true,
//   normalize: false,
//   horizontal: false,
//   subtransformSize: 8,
//   size: 8
// }]
```

## JavaScript API

### `fft(options)`

Perform the setup work required to use the FFT kernel in the fragment shader, `index.glsl`. Input arguments are:

- `input`: An identifier for the input framebuffer
- `output`: An identifier for the final output framebuffer
- `ping`: An identifier for the first ping-pong framebuffer
- `pong`: An identifier for the second ping-pong framebuffer
- `forward` (Boolean): `true` if the transform is in the forward direction
- `size` (Number): size of the transform, equal to the width or height. Currently must be a power of two and the width must equal the height.

Returns a list of passes. Each object in the list is a set of parameters that must either be used to bind the correct framebuffers or passed as uniforms to the fragment shader.

## GLSL API

### `#pragma glslify: fft = require(glsl-fft)`
### `vec4 fft(sampler2D src, float size, float subtransformSize, bool horizontal, bool forward, bool normalize)`

Returns the `gl_FragColor` in order to perform a single pass of the FFT comptuation. Uniforms map directly to the output of the JavaScript setup function, with the exception of `src` which is a `sampler2D` for the input framebuffer or texture.

### `#pragma glslify: wavenumber = require(glsl-fft/wavenumber)`
### `vec2 wavenumber(float size)`

Returns `vec2(kx, ky)`, where `kx` and `ky` are the wavenumber of the corresponding fragment of the Fourier Transform. Uses `gl_FragCoord` directly.

## License

&copy; Ricky Reusser 2017. MIT License. Based on the [filtering example][dli] of David Li. See LICENSE for more details.

[fft]: https://en.wikipedia.org/wiki/Fast_Fourier_transform
[dli]: https://github.com/dli/filtering
[regl]: https://github.com/regl-project/regl
