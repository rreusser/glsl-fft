const float TWOPI = 3.14159265358979 * 2.0;

vec2 wavenumber (vec2 resolution) {
  vec2 xy = (gl_FragCoord.xy - 0.5) * resolution;

  return vec2(
    (xy.x < 0.5) ? xy.x : xy.x - 1.0,
    (xy.y < 0.5) ? xy.y : xy.y - 1.0
  ) * TWOPI;
}

vec2 wavenumber (vec2 resolution, float dx) {
  vec2 xy = (gl_FragCoord.xy - 0.5) * resolution;

  return vec2(
    (xy.x < 0.5) ? xy.x : xy.x - 1.0,
    (xy.y < 0.5) ? xy.y : xy.y - 1.0
  ) * (TWOPI / dx);
}

vec2 wavenumber (vec2 resolution, vec2 dxy) {
  vec2 xy = (gl_FragCoord.xy - 0.5) * resolution;

  return vec2(
    (xy.x < 0.5) ? xy.x : xy.x - 1.0,
    (xy.y < 0.5) ? xy.y : xy.y - 1.0
  ) * TWOPI / dxy;
}

#pragma glslify: export(wavenumber)
