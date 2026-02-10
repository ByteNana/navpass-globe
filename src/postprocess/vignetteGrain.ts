export const VignetteGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.18 },
    uVignetteSoftness: { value: 0.65 },
    uGrain: { value: 0.035 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision mediump float;

    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uVignetteSoftness;
    uniform float uGrain;

    varying vec2 vUv;

    float hash(vec2 p) {
      // Cheap hash for grain/noise
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    void main() {
      vec4 col = texture2D(tDiffuse, vUv);

      // Vignette (very subtle, Google-style)
      vec2 d = vUv - 0.5;
      float r = length(d);
      float vig = smoothstep(0.85, uVignetteSoftness, r);
      col.rgb *= (1.0 - uVignette * vig);

      // Film grain (micro, animated)
      float n = hash(vUv * vec2(1920.0, 1080.0) + uTime * 60.0);
      float g = (n - 0.5) * uGrain;
      col.rgb += g;

      gl_FragColor = col;
    }
  `
}

