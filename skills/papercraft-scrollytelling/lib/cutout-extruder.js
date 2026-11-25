import * as THREE from 'three';

export function createPaperGrainTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = 118 + Math.random() * 24;
    d[i] = d[i + 1] = d[i + 2] = n;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 8 + Math.random() * 22;
    const ang = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export class CutoutExtruder {
  constructor(renderer, options = {}) {
    this.maxAnisotropy = renderer ? Math.min(16, renderer.capabilities.getMaxAnisotropy()) : 8;
    this.paperBump = createPaperGrainTexture(256);
    this.loader = new THREE.TextureLoader();
    this.textureCache = new Map();
    this.defaultThickness = options.thickness ?? 0.08;
  }

  loadTexture(url) {
    if (this.textureCache.has(url)) return this.textureCache.get(url);
    const tex = this.loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.maxAnisotropy;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    this.textureCache.set(url, tex);
    return tex;
  }

  createCard(cfg) {
    const {
      url,
      aspect = 1,
      height = 3.0,
      thickness = this.defaultThickness,
      emissiveIntensity = 0.0,
      emissiveColor = 0xffc878,
      anchor = 'bottom',
      castShadow = true,
      receiveShadow = true,
      opacity = 1.0,
      fadeable = false,
    } = cfg;

    const width = height * aspect;
    const tex = this.loadTexture(url);

    const group = new THREE.Group();
    // CRITICAL: 'YXZ' Euler order applies local X-hinge fold BEFORE vertical Y-yaw!
    // Guarantees angled cutouts (rotY !== 0) lie 100% flat & coplanar on the tabletop
    // with ZERO diagonal ground clipping!
    group.rotation.order = 'YXZ';
    const geo = new THREE.PlaneGeometry(width, height);

    if (anchor === 'bottom') {
      geo.translate(0, height * 0.5, 0);
    } else if (anchor === 'left') {
      geo.translate(width * 0.5, height * 0.5, 0);
    } else if (anchor === 'right') {
      geo.translate(-width * 0.5, height * 0.5, 0);
    }

    const useTrans = fadeable || opacity < 0.99;
    const alphaTest = useTrans ? 0.35 : 0.42;

    const frontMat = new THREE.MeshStandardMaterial({
      map: tex,
      alphaTest,
      transparent: useTrans,
      opacity,
      roughness: 0.91,
      metalness: 0.0,
      bumpMap: this.paperBump,
      bumpScale: 0.011,
      emissive: new THREE.Color(emissiveColor),
      emissiveMap: emissiveIntensity > 0 ? tex : null,
      emissiveIntensity,
      side: THREE.FrontSide,
    });
    const frontMesh = new THREE.Mesh(geo, frontMat);
    frontMesh.position.z = thickness * 0.5;
    frontMesh.castShadow = castShadow;
    frontMesh.receiveShadow = receiveShadow;
    group.add(frontMesh);

    const rimMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: new THREE.Color(0xfff5e4),
      alphaTest: 0.42,
      transparent: useTrans,
      opacity,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const rimMesh = new THREE.Mesh(geo, rimMat);
    rimMesh.position.z = thickness * 0.28;
    rimMesh.scale.set(1.003, 1.003, 1);
    group.add(rimMesh);

    const coreMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: new THREE.Color(0x3a2a1e),
      alphaTest: 0.42,
      transparent: useTrans,
      opacity,
      roughness: 0.98,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    for (const off of [0.10, -0.08, -0.26]) {
      const slice = new THREE.Mesh(geo, coreMat);
      slice.position.z = thickness * off;
      slice.scale.set(1.004, 1.004, 1);
      group.add(slice);
    }

    const backMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: new THREE.Color(0xe9dcc4),
      alphaTest: 0.42,
      transparent: useTrans,
      opacity,
      roughness: 0.96,
      metalness: 0.0,
      side: THREE.BackSide,
    });
    const backMesh = new THREE.Mesh(geo, backMat);
    backMesh.position.z = -thickness * 0.5;
    backMesh.receiveShadow = receiveShadow;
    group.add(backMesh);

    group.userData.cardSize = { width, height, thickness };
    group.userData.frontMesh = frontMesh;
    group.userData.fadeMaterials = [frontMat, rimMat, coreMat, backMat];
    return group;
  }
}
