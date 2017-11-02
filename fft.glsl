const float PI = 3.14159265;

vec2 multiplyComplex (vec2 a, vec2 b) {
  return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
}

vec4 fft (
  sampler2D src,
  float resolution,
  float subtransformSize,
  bool horizontal,
  bool forward,
  bool normalize
) {

  float index = (horizontal ? gl_FragCoord.x : gl_FragCoord.y) - 0.5;
  float evenIndex = floor(index / subtransformSize) * (subtransformSize * 0.5) + mod(index, subtransformSize * 0.5);

  vec4 even = vec4(0.0);
  vec4 odd = vec4(0.0);

  if (horizontal) {
    even = texture2D(src, vec2(evenIndex + 0.5, gl_FragCoord.y) / resolution);
    odd = texture2D(src, vec2(evenIndex + resolution * 0.5 + 0.5, gl_FragCoord.y) / resolution);
  } else {
    even = texture2D(src, vec2(gl_FragCoord.x, evenIndex + 0.5) / resolution);
    odd = texture2D(src, vec2(gl_FragCoord.x, evenIndex + resolution * 0.5 + 0.5) / resolution);
  }

  float res2;
  if (normalize) {
    res2 = 1.0 / (resolution * resolution);
    even *= res2;
    odd *= res2;
  }

  float twiddleArgument = (forward ? 2.0 : -2.0) * PI * (index / subtransformSize);
  vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));

  vec2 outputA = even.rg + multiplyComplex(twiddle, odd.rg);
  vec2 outputB = even.ba + multiplyComplex(twiddle, odd.ba);

  return vec4(outputA, outputB);
}


#pragma glslify: export(fft)
