const float TWOPI = 6.283185307179586;

vec4 fft (
  sampler2D src,
  vec2 resolution,
  float subtransformSize,
  bool horizontal,
  bool forward,
  float normalization
) {
  vec2 evenPos, oddPos, twiddle, outputA, outputB;
  vec4 even, odd;
  float index, evenIndex, twiddleArgument;

  index = (horizontal ? gl_FragCoord.x : gl_FragCoord.y) - 0.5;

  evenIndex = floor(index / subtransformSize) *
    (subtransformSize * 0.5) +
    mod(index, subtransformSize * 0.5) +
    0.5;

  if (horizontal) {
    evenPos = vec2(evenIndex, gl_FragCoord.y);
    oddPos = vec2(evenIndex, gl_FragCoord.y);
  } else {
    evenPos = vec2(gl_FragCoord.x, evenIndex);
    oddPos = vec2(gl_FragCoord.x, evenIndex);
  }

  evenPos *= resolution;
  oddPos *= resolution;

  if (horizontal) {
    oddPos.x += 0.5;
  } else {
    oddPos.y += 0.5;
  }

  //return vec4(evenPos.x, oddPos.x, 0.0, 0.0) / resolution.x - 0.5;

  even = texture2D(src, evenPos);
  odd = texture2D(src, oddPos);

  twiddleArgument = (forward ? TWOPI : -TWOPI) * (index / subtransformSize);
  twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));

  return (even.rgba + vec4(
    twiddle.x * odd.xz - twiddle.y * odd.yw,
    twiddle.y * odd.xz + twiddle.x * odd.yw
  ).xzyw) * normalization;
}

/*
vec2 multiplyComplex (vec2 a, vec2 b) {
  return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
}

const float PI = 3.14159265358979;

vec4 fft (
  sampler2D src,
  vec2 resolution,
  float subtransformSize,
  bool horizontal,
  bool forward,
  float normalization
) {
  float index = 0.0;

  if (horizontal) {
    index = gl_FragCoord.x - 0.5;
  } else {
    index = gl_FragCoord.y - 0.5;
  }

  float evenIndex = floor(index / subtransformSize) *
    (subtransformSize / 2.0) +
    mod(index, subtransformSize / 2.0);

  vec4 even = vec4(0.0);
  vec4 odd = vec4(0.0);

  if (horizontal) {
    even = texture2D(src, vec2(evenIndex + 0.5, gl_FragCoord.y) * resolution);
    odd = texture2D(src, vec2(evenIndex + 0.5 / resolution.x + 0.5, gl_FragCoord.y) * resolution);

    //return vec4(evenIndex, evenIndex + 0.5 / resolution.x, 0.0, 0.0);
  } else {
    even = texture2D(src, vec2(gl_FragCoord.x, evenIndex + 0.5) * resolution);
    odd = texture2D(src, vec2(gl_FragCoord.x, evenIndex + 0.5 / resolution.y + 0.5) * resolution);

    //return vec4(evenIndex, evenIndex + 0.5 / resolution.y, 0.0, 0.0);
  }

  float twiddleArgument = 0.0;
  if (forward) {
      twiddleArgument = 2.0 * PI * (index / subtransformSize);
  } else {
      twiddleArgument = -2.0 * PI * (index / subtransformSize);
  }
  vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));

  vec2 outputA = even.rg + multiplyComplex(twiddle, odd.rg);
  vec2 outputB = even.ba + multiplyComplex(twiddle, odd.ba);

  return vec4(outputA, outputB) * normalization;
}
*/

#pragma glslify: export(fft)
