vec2 wavenumber (float width, float height) {
  vec2 xy = gl_FragCoord.xy - 0.5;
  return vec2(
    ((xy.x < width * 0.5) ? xy.x : xy.x - width) / width,
    ((xy.y < height * 0.5) ? xy.y : xy.y - height) / height
  );
}

#pragma glslify: export(wavenumber)
