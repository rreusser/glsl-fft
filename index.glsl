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

  even = texture2D(src, evenPos);
  odd = texture2D(src, oddPos);

  twiddleArgument = (forward ? TWOPI : -TWOPI) * (index / subtransformSize);
  twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));

  return (even.rgba + vec4(
    twiddle.x * odd.xz - twiddle.y * odd.yw,
    twiddle.y * odd.xz + twiddle.x * odd.yw
  ).xzyw) * normalization;
}

#pragma glslify: export(fft)
