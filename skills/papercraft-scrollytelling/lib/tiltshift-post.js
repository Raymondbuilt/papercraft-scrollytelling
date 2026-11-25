import * as THREE from 'three';

/**
 * TiltShiftMacroPost v2.5
 * True Linear-HDR 2-pass MSAA Tilt-Shift Macro Depth of Field with Three.js native
 * ACES Filmic Tone Mapping + Linear-to-sRGB encoding.
 * Result: 100% identical brightness and vibrancy whether Tilt-Shift is ON or OFF,
 * with crystal-sharp center subject and silky tabletop macro bokeh at top & bottom.
 */
export class TiltShiftMacroPost {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    const size = new THREE.Vector2();
    renderer.getDrawingBufferSize(size);

    this.rt = new THREE.WebGLRenderTarget(size.x, size.y, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      samples: 4,
    });

    this.postScene = new THREE.Scene();
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.uniforms = {
      tDiffuse: { value: this.rt.texture },
      uResolution: { value: new THREE.Vector2(size.x, size.y) },
      uFocusY: { value: 0.48 },
      uFocusBand: { value: 0.25 },
      uBlurMax: { value: 3.1 },
      uTime: { value: 0.0 },
      uVignette: { value: 0.14 },
      uGrain: { value: 0.012 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      depthWrite: false,
      depthTest: false,
      toneMapped: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uFocusY;
        uniform float uFocusBand;
        uniform float uBlurMax;
        uniform float uTime;
        uniform float uVignette;
        uniform float uGrain;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          float dist = abs(vUv.y - uFocusY);
          float coc = smoothstep(uFocusBand, 0.56, dist);
          vec4 col;

          if (coc < 0.002) {
            // Razor-sharp center focus band — zero blur softening!
            col = texture2D(tDiffuse, vUv);
          } else {
            float radius = coc * uBlurMax;
            vec2 texel = radius / uResolution;
            // 12-tap circular linear-HDR macro bokeh kernel
            col  = texture2D(tDiffuse, vUv) * 0.16;
            col += texture2D(tDiffuse, vUv + vec2( 1.0,  0.0) * texel) * 0.085;
            col += texture2D(tDiffuse, vUv + vec2(-1.0,  0.0) * texel) * 0.085;
            col += texture2D(tDiffuse, vUv + vec2( 0.0,  1.0) * texel) * 0.085;
            col += texture2D(tDiffuse, vUv + vec2( 0.0, -1.0) * texel) * 0.085;
            col += texture2D(tDiffuse, vUv + vec2( 0.707,  0.707) * texel * 1.15) * 0.075;
            col += texture2D(tDiffuse, vUv + vec2(-0.707,  0.707) * texel * 1.15) * 0.075;
            col += texture2D(tDiffuse, vUv + vec2( 0.707, -0.707) * texel * 1.15) * 0.075;
            col += texture2D(tDiffuse, vUv + vec2(-0.707, -0.707) * texel * 1.15) * 0.075;
            col += texture2D(tDiffuse, vUv + vec2( 1.85,  0.45) * texel) * 0.05;
            col += texture2D(tDiffuse, vUv + vec2(-1.85, -0.45) * texel) * 0.05;
            col += texture2D(tDiffuse, vUv + vec2(-0.45,  1.85) * texel) * 0.05;
            col += texture2D(tDiffuse, vUv + vec2( 0.45, -1.85) * texel) * 0.05;
          }

          // Subtle studio tabletop vignette in linear space
          vec2 vc = vUv - 0.5;
          float vig = 1.0 - dot(vc, vc) * uVignette * 1.8;
          col.rgb *= clamp(vig, 0.84, 1.0);

          gl_FragColor = vec4(col.rgb, 1.0);

          // Native Three.js r160 ACES Filmic Tone Mapping + Linear-to-sRGB encoding!
          #include <tonemapping_fragment>
          #include <colorspace_fragment>

          // Ultra-fine subtle cardstock film grain in sRGB
          float g = (hash(vUv * uResolution * 0.5 + floor(uTime * 10.0)) - 0.5) * uGrain;
          gl_FragColor.rgb = clamp(gl_FragColor.rgb + g, 0.0, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    this.postScene.add(quad);
  }

  resize(width, height, dpr) {
    const w = Math.max(1, Math.floor(width * dpr));
    const h = Math.max(1, Math.floor(height * dpr));
    this.rt.setSize(w, h);
    this.uniforms.uResolution.value.set(w, h);
  }

  render(time) {
    if (!this.enabled) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.uniforms.uTime.value = time;
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCam);
  }
}
