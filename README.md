# glsl-fft

> GLSL setup for a [Fast Fourier Transform][fft] of two complex matrices

## Installation

```sh
$ npm install glsl-fft
```

## Example

```javascript
var fft = require('glsl-fft');

// Set up a forward transform:
var forwardTransform = fft({
  width: 4,
  height: 2,
  input: 'a',
  ping: 'b',
  pong: 'c',
  output: 'd',
  forward: true,
});

// Output is a list of passes:
// => [
//  {input: 'a', output: 'c', horizontal: true, forward: true, resolution: [ 0.25, 0.5 ], normalization: 1, subtransformSize: 2},
//  {input: 'c', output: 'b', horizontal: true, forward: true, resolution: [ 0.25, 0.5 ], normalization: 1, subtransformSize: 4},
//  {input: 'b', output: 'd', horizontal: false, forward: true, resolution: [ 0.25, 0.5 ], normalization: 1, subtransformSize: 2}
// ]
```

Usage of the GLSL fragment shader using the above parameters as uniforms:

```glsl
precision highp float;

#pragma glslify: fft = require(glsl-fft)

uniform sampler2D src;
uniform vec2 resolution;
uniform float subtransformSize, normalization;
uniform bool horizontal, forward;

void main () {
  gl_FragColor = fft(src, resolution, subtransformSize, horizontal, forward, normalization);
}
```

See [example/index.js](./example/index.js) for a fully worked angular [Gaussian blur][gaussian] example using [regl][regl].

## Usage 

### What does it compute?

This shader computes the 2D [Fast Fourier Transform][fft] of two complex input matrices contained in a single four-channel floating point (or half float) WebGL texture. The red and green channels contain the real and imaginary components of the first matrix, while the blue and alpha channels contain the real and imaginary components of the second matrix. The results match and are tested against [ndarray-fft][ndarray-fft].

### What is required?

This module does not interface with WebGL or have WebGL-specific peer dependencies. It only performs the setup work and exposes a fragment shader that performs the Fourier transform.

This module is designed for use with [glslify][glslify], though it's not required. It also works relatively effortlessly with [regl][regl], though that's also not required. At minimum, you'll need no less than two float or half-float WebGL framebuffers, including input, output, and two buffers to ping-pong back and forth between during the passes. The ping-pong framebuffers may include the input and output framebuffers as long as the parity of the number of steps permits the final output without requiring an extra copy operation.

The size of the textures must be a power of two, but not necessarily square.

### Is it fast?

As far as fast Fourier transforms go, it's not particularly optimized, though it's much faster than transferring data to and from the GPU each time you need to compute a Fourier transform.

## JavaScript API

### `require('glsl-fft')(options)`

Perform the setup work required to use the FFT kernel in the fragment shader, `index.glsl`. Input arguments are:

- `input` (`Any`): An identifier or object for the input framebuffer.
- `output` (`Any`): An identifier or object for the final output framebuffer.
- `ping` (`Any`): An identifier or object for the first ping-pong framebuffer.
- `pong` (`Any`): An identifier or object for the second ping-pong framebuffer.
- `forward` (`Boolean`): `true` if the transform is in the forward direction.
- `size` (`Number`): size of the input, equal to the `width` and `height`. Must be a power of two.
- `width` (`Number`): width of the input. Must be a power of two. Ignored if `size` is specified.
- `height` (`Number`): height of the input. Must be a power of two. Ignored if `size` is specifid.
- `splitNormalization`: (`Boolean`): If `true`, normalize by `1 / √(width * height)` on both the forward and inverse transforms. If `false`, normalize by `1 / (width * height)` on only the inverse transform. Default is `true`. Provided to avoid catastrophic overflow during the forward transform when using half-float textures. One-way transforms will match [ndarray-fft][ndarray-fft] only if `false`.

Returns a list of passes. Each object in the list is a set of parameters that must either be used to bind the correct framebuffers or passed as uniforms to the fragment shader.

## GLSL API

### `#pragma glslify: fft = require(glsl-fft)`
### `vec4 fft(sampler2D src, vec2 resolution, float subtransformSize, bool horizontal, bool forward, float normalization)`

Returns the `gl_FragColor` in order to perform a single pass of the FFT comptuation. Uniforms map directly to the output of the JavaScript setup function, with the exception of `src` which is a `sampler2D` for the input framebuffer or texture.

### `#pragma glslify: wavenumber = require(glsl-fft/wavenumber)`
### `vec2 wavenumber(vec2 resolution)`
### `vec2 wavenumber(vec2 resolution, float dxy)`
### `vec2 wavenumber(vec2 resolution, vec2 dxy)`

Parameters are:
- `resolution`: a `vec2` containing `1 / width` and `1 / height`.
- `dxy` (optional): Either a float representing the sample spacing in either direction, or a `vec2` representing the sample spacing in the horizontal and vertical directions, respectively.

Returns `vec2(kx, ky)`, where `kx` and `ky` are the angular wavenumbers of the corresponding texel of the Fourier Transformed data.

## See also

- [ndarray-fft][ndarray-fft]
- [glsl-rfft][glsl-rfft]

## License

&copy; Ricky Reusser 2017. MIT License. Based on the [filtering example][dli] of David Li. See LICENSE for more details.

[glslify]: https://github.com/glslify/glslify
[fft]: https://en.wikipedia.org/wiki/Fast_Fourier_transform
[dli]: https://github.com/dli/filtering
[regl]: https://github.com/regl-project/regl
[ndarray-fft]: https://github.com/scijs/ndarray-fft
[gaussian]: https://en.wikipedia.org/wiki/Gaussian_blur
[glsl-rfft]: https://github.com/rreusser/glsl-rfft
