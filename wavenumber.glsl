vec2 wavenumber (float size) {
  vec2 xy = gl_FragCoord.xy - 0.5;
  return vec2(
    (xy.x < size * 0.5) ? xy.x : xy.x - size,
    (xy.y < size * 0.5) ? xy.y : xy.y - size
  );
}

#pragma glslify: export(wavenumber)
