vec2 wavenumber (float resolution) {
  vec2 xy = gl_FragCoord.xy - 0.5;
  return vec2(
    (xy.x < resolution * 0.5) ? xy.x : xy.x - resolution,
    (xy.y < resolution * 0.5) ? xy.y : xy.y - resolution
  );
}

#pragma glslify: export(wavenumber)
