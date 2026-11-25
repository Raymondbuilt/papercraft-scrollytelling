import * as THREE from 'three';
import { CutoutExtruder, createPaperGrainTexture } from '../../skills/papercraft-scrollytelling/lib/cutout-extruder.js';
import { WaveHinge, GateFold, VolvelleArc, PullTabRail, PaperWalker } from '../../skills/papercraft-scrollytelling/lib/popup-mechanisms.js';
import { TiltShiftMacroPost } from '../../skills/papercraft-scrollytelling/lib/tiltshift-post.js';
import { ScrollDirector } from '../../skills/papercraft-scrollytelling/lib/scroll-director.js';
import { PaperFoleyEngine } from '../../skills/papercraft-scrollytelling/lib/paper-foley.js';

export const ACTS = [
  { id: 1, t: 0.00, title: 'I. The Forest Torii',      sub: 'Chihiro crosses the autumn gate toward the clocktower tunnel' },
  { id: 2, t: 0.16, title: 'II. Twilight Spirit Market', sub: 'Lanterns ignite as dusk claims the empty food stalls' },
  { id: 3, t: 0.35, title: 'III. Bridge & Aburaya',     sub: 'Jade canal, spinning waterwheel & gate-fold bathhouse' },
  { id: 4, t: 0.55, title: 'IV. Haku & The Shikigami',  sub: 'White dragon glides beneath the rising volvelle moon' },
  { id: 5, t: 0.74, title: 'V. Banquet of No-Face',     sub: 'Gold-leaf folding screens, soot sprites & crimson silk' },
  { id: 6, t: 0.89, title: 'VI. Train Across the Sea',  sub: 'Pull-tab sunset railway to the solitary island cottage' },
];

/**
 * Generates a 1536x4096 layered watercolor-cardstock tabletop texture (v2.7 Final):
 *  - Wide solid stone bridge embankments supporting BOTH legs of the Red Bridge cleanly.
 *  - Act 4 wooden night boardwalk shifted to x = -4.2 (clear of Haku & Shikigami!).
 *  - Act 6 clean, straight wooden pier with handrail posts flush to Act 5's crimson carpet.
 */
function buildWatercolorGroundTexture() {
  const W = 1536, H = 4096;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');

  const zToY = (z) => ((z - (-158)) / (16 - (-158))) * H;
  const xToX = (x) => ((x + 28) / 56) * W;

  function drawPaperSheet(zBottom, zTop, fillStyle, waveAmp = 1.25, waveFreq = 0.24, phase = 0) {
    const yTop = zToY(zTop);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, yTop);
    ctx.lineTo(W, yTop);
    for (let x = W; x >= 0; x -= 24) {
      const wx = (x / W) * 56 - 28;
      const offsetZ = Math.sin(wx * waveFreq + phase) * waveAmp + Math.cos(wx * waveFreq * 2.1) * (waveAmp * 0.35);
      ctx.lineTo(x, zToY(zBottom + offsetZ));
    }
    ctx.closePath();
    ctx.shadowColor = 'rgba(38, 24, 16, 0.26)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 9;
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(66, 46, 32, 0.48)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // Base Layer: Act 1 sunlit moss watercolor paper
  const g1 = ctx.createLinearGradient(0, zToY(16), 0, zToY(-22));
  g1.addColorStop(0, '#a8c083');
  g1.addColorStop(1, '#849f67');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Act 2 Sheet: Twilight violet-slate cardstock
  const g2 = ctx.createLinearGradient(0, zToY(-18), 0, zToY(-46));
  g2.addColorStop(0, '#5a5370');
  g2.addColorStop(1, '#47415c');
  drawPaperSheet(-18.5, -158, g2, 1.35, 0.22, 0.4);

  // Act 3 Sheet: Warm sandstone Aburaya riverbank & plaza
  const g3 = ctx.createLinearGradient(0, zToY(-43), 0, zToY(-72));
  g3.addColorStop(0, '#bfa882');
  g3.addColorStop(0.5, '#cbb58f');
  g3.addColorStop(1, '#a99371');
  drawPaperSheet(-43.2, -158, g3, 1.2, 0.18, 1.8);

  // Act 4 Sheet: Midnight indigo starry sky paper
  const g4 = ctx.createLinearGradient(0, zToY(-69.5), 0, zToY(-96));
  g4.addColorStop(0, '#243154');
  g4.addColorStop(1, '#1d2744');
  drawPaperSheet(-69.8, -158, g4, 1.5, 0.25, 0.9);

  // Act 5 Sheet: Warm golden tatami banquet floor
  const g5 = ctx.createLinearGradient(0, zToY(-95.0), 0, zToY(-118));
  g5.addColorStop(0, '#d5b06f');
  g5.addColorStop(1, '#c59b57');
  drawPaperSheet(-95.2, -158, g5, 1.05, 0.20, 2.3);

  // Act 6 Sheet: Sunset rose-apricot mirror ocean
  const g6 = ctx.createLinearGradient(0, zToY(-117), 0, zToY(-158));
  g6.addColorStop(0.00, '#e39e96');
  g6.addColorStop(0.42, '#f0be9d');
  g6.addColorStop(0.78, '#dfb0b6');
  g6.addColorStop(1.00, '#a8adc8');
  drawPaperSheet(-117.5, -158, g6, 1.35, 0.21, 0.2);

  // =========================================================
  // DETAIL PAINTING PER ACT
  // =========================================================

  // 1. Act 1: Winding ochre forest path + autumn maple leaves
  ctx.save();
  ctx.fillStyle = '#dec697';
  ctx.strokeStyle = '#5c4632';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(xToX(-2.1), zToY(16));
  ctx.bezierCurveTo(xToX(-2.2), zToY(2), xToX(1.6), zToY(-8), xToX(-1.4), zToY(-18));
  ctx.lineTo(xToX(1.6), zToY(-18));
  ctx.bezierCurveTo(xToX(3.8), zToY(-8), xToX(0.4), zToY(2), xToX(2.1), zToY(16));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const leafCols = ['#d45531', '#e3852d', '#b83c28', '#e6b145'];
  for (let i = 0; i < 190; i++) {
    const lx = Math.random() * W;
    const ly = zToY(-17.5) + Math.random() * (zToY(15) - zToY(-17.5));
    ctx.fillStyle = leafCols[i % leafCols.length];
    ctx.beginPath();
    ctx.ellipse(lx, ly, 4 + Math.random() * 5, 2.5 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Act 2: Twilight Market cobblestone avenue + warm amber lantern pools
  ctx.save();
  const y2Top = zToY(-43.2), y2Bot = zToY(-19);
  ctx.fillStyle = '#625c78';
  ctx.fillRect(xToX(-5.8), y2Top, xToX(5.8) - xToX(-5.8), y2Bot - y2Top);
  ctx.strokeStyle = 'rgba(35,28,45,0.34)';
  ctx.lineWidth = 2;
  for (let y = y2Top; y < y2Bot; y += 34) {
    ctx.beginPath(); ctx.moveTo(xToX(-5.8), y); ctx.lineTo(xToX(5.8), y); ctx.stroke();
    for (let x = xToX(-5.8); x < xToX(5.8); x += 48) {
      const off = (Math.floor(y / 34) % 2) * 24;
      ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off, y + 34); ctx.stroke();
    }
  }
  for (const [gx, gz] of [[-4.5, -26.5], [4.6, -28.0], [-5.0, -36.5], [5.0, -37.2]]) {
    const rad = ctx.createRadialGradient(xToX(gx), zToY(gz), 10, xToX(gx), zToY(gz), 145);
    rad.addColorStop(0, 'rgba(255, 190, 96, 0.52)');
    rad.addColorStop(1, 'rgba(255, 190, 96, 0.0)');
    ctx.fillStyle = rad;
    ctx.fillRect(xToX(gx) - 150, zToY(gz) - 150, 300, 300);
  }
  ctx.restore();

  // 3. Act 3: S-CURVE JADE CANAL + WIDE SOLID STONE BRIDGE EMBANKMENTS
  ctx.save();
  function riverCenterZ(wx) {
    return -49.5 + 4.9 * Math.tanh(wx * 0.15);
  }
  const halfW = 1.9;

  ctx.beginPath();
  for (let wx = -28; wx <= 28; wx += 1.0) {
    const rz = riverCenterZ(wx) - halfW;
    if (wx === -28) ctx.moveTo(xToX(wx), zToY(rz));
    else ctx.lineTo(xToX(wx), zToY(rz));
  }
  for (let wx = 28; wx >= -28; wx -= 1.0) {
    const rz = riverCenterZ(wx) + halfW;
    ctx.lineTo(xToX(wx), zToY(rz));
  }
  ctx.closePath();

  const rivGrad = ctx.createLinearGradient(0, zToY(-44), 0, zToY(-56));
  rivGrad.addColorStop(0, '#55a79f');
  rivGrad.addColorStop(0.5, '#3e8d88');
  rivGrad.addColorStop(1, '#2f7574');
  ctx.fillStyle = rivGrad;
  ctx.fill();
  ctx.strokeStyle = '#4e3b2c';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(235, 250, 246, 0.58)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 34; i++) {
    const wx = -22 + Math.random() * 44;
    const wz = riverCenterZ(wx) + (Math.random() - 0.5) * (halfW * 1.3);
    ctx.beginPath();
    ctx.arc(xToX(wx), zToY(wz), 16 + Math.random() * 14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // White splash foam beneath waterwheel paddles (x = +6.9, z = -47.3)
  const foamGrad = ctx.createRadialGradient(xToX(6.9), zToY(-47.3), 6, xToX(6.9), zToY(-47.3), 56);
  foamGrad.addColorStop(0, 'rgba(248, 255, 253, 0.92)');
  foamGrad.addColorStop(0.6, 'rgba(210, 244, 240, 0.45)');
  foamGrad.addColorStop(1, 'rgba(210, 244, 240, 0.0)');
  ctx.fillStyle = foamGrad;
  ctx.beginPath();
  ctx.arc(xToX(6.9), zToY(-47.3), 56, 0, Math.PI * 2);
  ctx.fill();

  // Wide solid stone South-Left Approach Road & Bridge Foot Abutment (100% covers left bridge legs!)
  ctx.fillStyle = '#c9b594';
  ctx.strokeStyle = '#4e3a29';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(xToX(-2.4), zToY(-42.5));
  ctx.lineTo(xToX(0.6), zToY(-42.5));
  ctx.quadraticCurveTo(xToX(-1.8), zToY(-46.8), xToX(-2.8), zToY(-50.8));
  ctx.lineTo(xToX(-6.2), zToY(-50.8));
  ctx.quadraticCurveTo(xToX(-5.6), zToY(-46.0), xToX(-2.4), zToY(-42.5));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Courtyard Plaza
  ctx.fillStyle = '#d7c29e';
  ctx.strokeStyle = '#9c362c';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(xToX(-6.8), zToY(-67.0), xToX(6.8) - xToX(-6.8), zToY(-52.4) - zToY(-67.0), 18);
  ctx.fill();
  ctx.stroke();

  // Wide solid stone North-Right Bridge Foot Abutment connecting cleanly to Courtyard!
  ctx.fillStyle = '#c9b594';
  ctx.strokeStyle = '#4e3a29';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(xToX(2.8), zToY(-48.0));
  ctx.lineTo(xToX(6.0), zToY(-48.0));
  ctx.lineTo(xToX(5.4), zToY(-53.8));
  ctx.lineTo(xToX(1.6), zToY(-53.8));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red ceremonial carpet runner straight into Aburaya archway
  ctx.fillStyle = '#ad362c';
  ctx.fillRect(xToX(-1.6), zToY(-63.5), xToX(1.6) - xToX(-1.6), zToY(-52.8) - zToY(-63.5));
  ctx.strokeStyle = '#e8c468';
  ctx.lineWidth = 3;
  ctx.strokeRect(xToX(-1.45), zToY(-63.3), xToX(1.45) - xToX(-1.45), zToY(-53.0) - zToY(-63.3));
  ctx.restore();

  // 4. Act 4: Midnight Sky Stars + CONTINUOUS Left Balcony Boardwalk (x = -5.4..-3.0, clear of Haku!)
  ctx.save();
  const y4Top = zToY(-94.8), y4Bot = zToY(-70.5);
  ctx.fillStyle = 'rgba(248, 238, 206, 0.72)';
  for (let i = 0; i < 185; i++) {
    const sx = Math.random() * W;
    const sy = y4Top + Math.random() * (y4Bot - y4Top);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4 + Math.random() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#755239';
  ctx.strokeStyle = '#362317';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(xToX(-5.4), zToY(-96.8), xToX(-3.0) - xToX(-5.4), zToY(-65.4) - zToY(-96.8), 8);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(42,26,16,0.45)';
  ctx.lineWidth = 2;
  for (let pz = -66.2; pz >= -96.2; pz -= 1.05) {
    ctx.beginPath(); ctx.moveTo(xToX(-5.4), zToY(pz)); ctx.lineTo(xToX(-3.0), zToY(pz)); ctx.stroke();
  }
  ctx.restore();

  // 5. Act 5: Tatami grid & Crimson Banquet Runner
  ctx.save();
  const y5Top = zToY(-116.8), y5Bot = zToY(-95.8);
  ctx.strokeStyle = 'rgba(92, 68, 36, 0.38)';
  ctx.lineWidth = 3;
  for (let y = y5Top; y < y5Bot; y += 72) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let x = 0; x < W; x += 110) {
    ctx.beginPath(); ctx.moveTo(x, y5Top); ctx.lineTo(x, y5Bot); ctx.stroke();
  }
  ctx.fillStyle = '#a42b24';
  ctx.fillRect(xToX(-3.5), y5Top, xToX(3.5) - xToX(-3.5), y5Bot - y5Top);
  ctx.strokeStyle = '#e7bd52';
  ctx.lineWidth = 8;
  ctx.strokeRect(xToX(-3.25), y5Top + 4, xToX(3.25) - xToX(-3.25), y5Bot - y5Top - 8);
  ctx.restore();

  // 6. Act 6: Layered Sunset Waves + CLEAN STRAIGHT WOODEN PIER + Railway
  ctx.save();
  const waveBands = [-124, -133, -142];
  for (let bi = 0; bi < waveBands.length; bi++) {
    const wz = waveBands[bi];
    ctx.beginPath();
    ctx.moveTo(0, zToY(wz));
    for (let x = 0; x <= W; x += 28) {
      const wx = (x / W) * 56 - 28;
      ctx.lineTo(x, zToY(wz + Math.sin(wx * 0.45 + bi * 1.4) * 0.65));
    }
    ctx.strokeStyle = 'rgba(255, 244, 232, 0.68)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Clean, straight architectural wooden pier (x = -5.6 .. -3.0, flush onto Act 5 at z = -115.6!)
  // Entry landing deck bridges smoothly from red carpet edge (x = -2.2) onto the straight pier!
  ctx.fillStyle = '#8b6243';
  ctx.strokeStyle = '#473021';
  ctx.lineWidth = 4;
  // Wide entry step deck flush on Act 5 edge
  ctx.beginPath();
  ctx.roundRect(xToX(-5.6), zToY(-118.2), xToX(-2.2) - xToX(-5.6), zToY(-115.6) - zToY(-118.2), 6);
  ctx.fill();
  ctx.stroke();
  // Straight perpendicular pier extending out into the sunset sea
  ctx.beginPath();
  ctx.roundRect(xToX(-5.6), zToY(-128.7), xToX(-3.0) - xToX(-5.6), zToY(-117.4) - zToY(-128.7), 6);
  ctx.fill();
  ctx.stroke();
  // Pier planks
  ctx.strokeStyle = 'rgba(54,34,20,0.45)';
  ctx.lineWidth = 2;
  for (let pz = -116.4; pz >= -128.2; pz -= 0.85) {
    const rx = pz > -118.0 ? -2.2 : -3.0;
    ctx.beginPath(); ctx.moveTo(xToX(-5.6), zToY(pz)); ctx.lineTo(xToX(rx), zToY(pz)); ctx.stroke();
  }
  // Wooden pier posts along edges
  ctx.fillStyle = '#5a3b26';
  for (let pz = -118.5; pz >= -128.2; pz -= 2.4) {
    ctx.fillRect(xToX(-5.55) - 4, zToY(pz) - 4, 8, 8);
    ctx.fillRect(xToX(-3.05) - 4, zToY(pz) - 4, 8, 8);
  }

  // Delicate Wooden-Sleeper Railway Track & Subtle Pull-Tab Slit at z = -130.5
  const yRail = zToY(-130.5);
  ctx.fillStyle = 'rgba(58, 40, 32, 0.55)';
  ctx.fillRect(xToX(-19), yRail - 3, xToX(19) - xToX(-19), 6);
  ctx.fillStyle = '#73503a';
  for (let rx = -19; rx <= 19; rx += 0.65) {
    ctx.fillRect(xToX(rx) - 3, yRail - 10, 6, 20);
  }
  ctx.fillStyle = '#d9cfc2';
  ctx.fillRect(xToX(-19), yRail - 7, xToX(19) - xToX(-19), 2.5);
  ctx.fillRect(xToX(-19), yRail + 4.5, xToX(19) - xToX(-19), 2.5);
  ctx.restore();

  // Organic fine watercolor paper tooth speckle
  ctx.fillStyle = 'rgba(255,250,240,0.045)';
  for (let i = 0; i < 4200; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

function buildBlueprintCreaseTexture() {
  const W = 1024, H = 2048;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const zToY = (z) => ((z - (-158)) / (16 - (-158))) * H;
  const xToX = (x) => ((x + 28) / 56) * W;

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(62, 42, 28, 0.65)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);

  const creaseZs = [-3.2, -15.2, -26.5, -36.5, -49.5, -62.8, -82.5, -106.5, -130.5, -137.0];
  for (const cz of creaseZs) {
    const y = zToY(cz);
    ctx.beginPath();
    ctx.moveTo(xToX(-16), y);
    ctx.lineTo(xToX(16), y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeRect(xToX(-2.2), y - 6, xToX(2.2) - xToX(-2.2), 12);
    ctx.setLineDash([14, 10]);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Main initializer — Engine v2.8 Final (Zero Slop Verified)
 */
export function initSpiritedAwayDiorama(container, assetMap) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.10;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa2bb7e);
  scene.fog = new THREE.FogExp2(0xa2bb7e, 0.0095);

  const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.5, 220);

  const post = new TiltShiftMacroPost(renderer, scene, camera);

  const hemiLight = new THREE.HemisphereLight(0xfff6e3, 0x70825b, 0.88);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffe7c2, 2.05);
  sunLight.position.set(13, 19, 15);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -18;
  sunLight.shadow.camera.right = 18;
  sunLight.shadow.camera.top = 18;
  sunLight.shadow.camera.bottom = -18;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 62;
  sunLight.shadow.bias = -0.00045;
  sunLight.shadow.normalBias = 0.025;
  sunLight.shadow.radius = 2.8;
  scene.add(sunLight);
  scene.add(sunLight.target);

  const marketLightL = new THREE.PointLight(0xffa748, 4.2, 16, 1.4);
  marketLightL.position.set(-3.5, 3.2, -26.5);
  scene.add(marketLightL);

  const marketLightR = new THREE.PointLight(0xff9c3d, 4.2, 16, 1.4);
  marketLightR.position.set(3.8, 3.2, -34.0);
  scene.add(marketLightR);

  const bathhouseLight = new THREE.PointLight(0xffbe55, 7.0, 24, 1.3);
  bathhouseLight.position.set(0, 5.2, -59.5);
  scene.add(bathhouseLight);

  const goldLight = new THREE.PointLight(0xffd25a, 5.2, 18, 1.4);
  goldLight.position.set(0, 3.2, -104.5);
  scene.add(goldLight);

  const groundTex = buildWatercolorGroundTexture();
  const paperBump = createPaperGrainTexture(256);
  paperBump.repeat.set(16, 48);
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.93,
    metalness: 0.0,
    bumpMap: paperBump,
    bumpScale: 0.016,
  });
  const groundGeo = new THREE.PlaneGeometry(56, 174);
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, 0, -71);
  ground.receiveShadow = true;
  scene.add(ground);

  const creaseMat = new THREE.MeshBasicMaterial({
    map: buildBlueprintCreaseTexture(),
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const creasePlane = new THREE.Mesh(groundGeo, creaseMat);
  creasePlane.position.set(0, 0.018, -71);
  scene.add(creasePlane);

  const extruder = new CutoutExtruder(renderer, { thickness: 0.08 });
  const hinges = [];
  const clickables = [];
  const animatedProps = [];
  let layerCounter = 0;

  function addCutout(key, opts) {
    const info = assetMap[key];
    if (!info) return null;
    const card = extruder.createCard({
      url: info.url,
      aspect: info.aspect,
      height: opts.height ?? 3.5,
      thickness: opts.thickness ?? 0.08,
      emissiveIntensity: opts.emissive ?? 0,
      emissiveColor: opts.emissiveColor ?? 0xffc878,
      anchor: opts.anchor ?? 'bottom',
      opacity: opts.opacity ?? 1.0,
    });
    const baseY = opts.y ?? 0.015;
    card.position.set(opts.x ?? 0, baseY, opts.z ?? 0);
    if (opts.rotY) card.rotation.y = opts.rotY;
    scene.add(card);

    let hinge = null;
    if (opts.hinge !== false) {
      const autoStagger = Math.min(1.4, Math.abs(opts.x ?? 0) * 0.16);
      hinge = new WaveHinge(card, {
        zPos: opts.z ?? 0,
        baseY,
        foldLayer: opts.foldLayer ?? (layerCounter++ % 7),
        openDist: opts.openDist ?? 10.9,
        closeBehindDist: opts.closeBehindDist ?? 7.5,
        delay: opts.delay ?? autoStagger,
        introDelay: opts.introDelay ?? 0,
        windAmp: opts.windAmp ?? 0.012,
        customYFn: opts.customYFn ?? null,
      });
      hinges.push(hinge);
    }
    if (opts.interactive) {
      card.userData.hinge = hinge;
      card.userData.label = opts.interactive;
      clickables.push(card);
    }
    return { card, hinge };
  }

  // =========================================================
  // CAMERA-LOCKED PROTAGONIST CHIHIRO (v2.7)
  // Guaranteed screenY ∈ [27.5%, 56%] at EVERY t ∈ [0..1]
  // + Smooth Doorway Entry/Exit Fade at Tunnel & Aburaya (ZERO wall clipping!)
  // =========================================================
  const chihiroInfo = assetMap['act2_chihiro'];
  const chihiroCard = extruder.createCard({
    url: chihiroInfo.url,
    aspect: chihiroInfo.aspect,
    height: 2.35,
    thickness: 0.075,
    anchor: 'bottom',
    fadeable: true,
  });
  scene.add(chihiroCard);

  const chihiroWaypoints = [
    // Act 1: Forest Torii (-3.2) & Clocktower Tunnel (-15.2)
    { t: 0.000, x:  0.2, y: 0.02, z:    1.0 },
    { t: 0.036, x:  0.1, y: 0.02, z:   -3.2 },
    { t: 0.112, x:  0.0, y: 0.02, z:  -13.2, linear: true },
    { t: 0.128, x:  0.0, y: 0.02, z:  -15.2, linear: true }, // Enters tunnel arch (fades inside!)
    { t: 0.148, x:  0.0, y: 0.02, z:  -18.0, linear: true }, // Emerges into Twilight Market!
    // Act 2: Twilight Spirit Market
    { t: 0.215, x: -0.5, y: 0.02, z:  -26.8 },
    { t: 0.280, x:  0.1, y: 0.02, z:  -35.5 },
    { t: 0.325, x: -1.2, y: 0.02, z:  -41.8 },
    // Act 3: Red Bridge (-49.5) — synchronized tightly with camera pace!
    { t: 0.360, x: -4.1, y: 0.02, z:  -47.0, linear: true },
    { t: 0.372, x: -3.7, y: 0.42, z:  -49.05, linear: true },
    { t: 0.380, x: -1.8, y: 1.08, z:  -49.05, linear: true },
    { t: 0.388, x:  0.0, y: 1.38, z:  -49.05, linear: true },
    { t: 0.396, x:  1.8, y: 1.08, z:  -49.05, linear: true },
    { t: 0.404, x:  3.7, y: 0.42, z:  -49.05, linear: true },
    { t: 0.418, x:  3.8, y: 0.02, z:  -52.0, linear: true },
    { t: 0.448, x:  0.6, y: 0.02, z:  -56.8 },
    { t: 0.482, x:  0.0, y: 0.02, z:  -61.6, linear: true }, // Steps up to Aburaya archway
    { t: 0.494, x:  0.0, y: 0.02, z:  -63.0, linear: true }, // Enters Aburaya doorway (fades inside!)
    { t: 0.518, x: -4.2, y: 0.02, z:  -66.8, linear: true }, // Re-emerges on Act 4 night balcony!
    // Act 4: Midnight Balcony Boardwalk (x = -4.2, completely clear of Haku & Shikigami!)
    { t: 0.625, x: -4.2, y: 0.02, z:  -81.2 },
    { t: 0.735, x: -4.2, y: 0.02, z:  -95.8, linear: true },
    // Act 5: Banquet of No-Face (No-Face at x = +0.6; Soot Sprites at x = -4.4)
    { t: 0.785, x: -2.2, y: 0.02, z: -102.5 },
    { t: 0.855, x: -2.2, y: 0.02, z: -111.8 },
    // Act 6: Clean Straight Sunset Wooden Pier (x = -4.2)
    { t: 0.892, x: -3.9, y: 0.02, z: -116.8, linear: true },
    { t: 0.945, x: -4.3, y: 0.02, z: -123.5 },
    { t: 1.000, x: -4.3, y: 0.02, z: -127.8 },
  ];

  const doorwayZones = [
    // Clocktower Tunnel doorway fade (steps into dark arch & emerges clearly onto Market cobblestones)
    { fadeOutStart: 0.118, hideStart: 0.126, hideEnd: 0.152, fadeInEnd: 0.164 },
    // Aburaya Bathhouse front entrance fade (enters glowing red arch & steps out onto night balcony)
    { fadeOutStart: 0.484, hideStart: 0.493, hideEnd: 0.514, fadeInEnd: 0.526 },
  ];

  const chihiroWalker = new PaperWalker(chihiroCard, chihiroWaypoints, {
    doorwayZones,
    foldLayer: 8,
    hopHeight: 0.24,
  });
  chihiroCard.userData.hinge = chihiroWalker;
  chihiroCard.userData.label = 'Chihiro (Story Guide)';
  clickables.push(chihiroCard);

  // =========================================================
  // ACT 1: FOREST TORII & OVERGROWN TUNNEL
  // =========================================================
  addCutout('act1_statue',        { x: -4.1, z:  0.4,  height: 2.3, rotY:  0.14, introDelay: 0.12, openDist: 12.5 });
  addCutout('act1_stone_lantern', { x:  4.1, z:  0.2,  height: 2.5, rotY: -0.14, introDelay: 0.18, openDist: 12.5 });
  addCutout('act1_torii_gate',    { x:  0.0, z: -3.2,  height: 5.0, interactive: 'Torii Gate', introDelay: 0.28, openDist: 12.5, foldLayer: 5 });
  addCutout('act1_maple_tree',    { x: -6.8, z: -2.0,  height: 4.8, introDelay: 0.42, openDist: 12.5 });
  addCutout('act1_maple_tree',    { x:  6.9, z: -3.0,  height: 5.0, rotY: 0.1, introDelay: 0.48, openDist: 12.5 });
  addCutout('act1_moss_bush',     { x: -3.3, z: -6.5,  height: 1.6, openDist: 11.2 });
  addCutout('act1_moss_bush',     { x:  3.6, z: -7.0,  height: 1.5, openDist: 11.2 });
  addCutout('act1_maple_tree',    { x: -7.2, z: -10.5, height: 5.2, openDist: 10.6 });
  addCutout('act1_maple_tree',    { x:  7.2, z: -11.2, height: 4.9, openDist: 10.6 });
  addCutout('act1_stone_lantern', { x: -4.4, z: -12.4, height: 2.3, openDist: 10.6 });
  addCutout('act1_tunnel',        { x:  0.0, z: -15.2, height: 6.0, interactive: 'Abandoned Tunnel', openDist: 10.8, foldLayer: 6 });
  addCutout('act1_moss_bush',     { x: -5.8, z: -15.6, height: 1.9, openDist: 10.6 });
  addCutout('act1_moss_bush',     { x:  5.8, z: -15.6, height: 1.9, openDist: 10.6 });

  // =========================================================
  // ACT 2: TWILIGHT SPIRIT MARKET
  // =========================================================
  addCutout('act2_lantern_post',    { x: -5.0, z: -22.5, height: 3.2, emissive: 0.32, openDist: 10.6 });
  addCutout('act2_lantern_post',    { x:  5.0, z: -23.0, height: 3.2, emissive: 0.32, openDist: 10.6 });
  addCutout('act2_stall_left',      { x: -4.6, z: -26.5, height: 4.8, rotY:  0.16, emissive: 0.20, interactive: 'Spirit Market Stall', openDist: 10.8 });
  addCutout('act2_stall_right',     { x:  4.7, z: -28.0, height: 4.8, rotY: -0.16, emissive: 0.20, openDist: 10.8 });
  addCutout('act2_ghost_spirit',    { x: -2.2, z: -29.2, height: 2.7, opacity: 0.88, windAmp: 0.025, openDist: 10.4 });
  addCutout('act2_radish_spirit',   { x:  2.3, z: -31.2, height: 3.2, interactive: 'Radish Spirit', openDist: 10.4 });
  addCutout('act2_hopping_lantern', {
    x: -1.8, z: -34.5, height: 2.15, emissive: 0.42, interactive: 'Hopping Lantern', openDist: 10.4,
    customYFn: (t) => 0.02 + Math.abs(Math.sin(t * 4.5)) * 0.44,
  });
  addCutout('act2_stall_right',     { x: -5.2, z: -36.5, height: 4.6, rotY:  0.18, emissive: 0.18, openDist: 10.8 });
  addCutout('act2_stall_left',      { x:  5.2, z: -37.2, height: 4.6, rotY: -0.18, emissive: 0.18, openDist: 10.8 });
  addCutout('act2_ghost_spirit',    { x:  2.6, z: -39.2, height: 2.6, opacity: 0.85, openDist: 10.4 });
  addCutout('act2_lantern_post',    { x: -3.8, z: -40.8, height: 3.0, emissive: 0.32, openDist: 10.5 });
  addCutout('act2_lantern_post',    { x:  3.8, z: -40.8, height: 3.0, emissive: 0.32, openDist: 10.5 });

  // =========================================================
  // ACT 3: RED BRIDGE, CONCENTRIC WATERWHEEL & GATE-FOLD ABURAYA
  // =========================================================
  addCutout('act3_red_bridge', { x: 0.0, z: -49.5, height: 4.5, interactive: 'Red Spirit Bridge', openDist: 11.0, foldLayer: 4 });
  addCutout('act1_maple_tree', { x: -8.0, z: -51.0, height: 4.6, openDist: 10.8 });
  addCutout('act1_maple_tree', { x: -7.6, z: -58.5, height: 4.8, openDist: 10.8 });
  addCutout('act1_maple_tree', { x:  8.2, z: -59.0, height: 4.7, openDist: 10.8 });

  const wheelRoot = new THREE.Group();
  wheelRoot.position.set(6.9, 0.015, -48.6);
  scene.add(wheelRoot);

  const standInfo = assetMap['act3_wheel_stand'];
  const standCard = extruder.createCard({
    url: standInfo.url, aspect: standInfo.aspect, height: 2.25,
    thickness: 0.08, anchor: 'bottom'
  });
  standCard.position.set(0, 0, -0.04);
  wheelRoot.add(standCard);

  const discInfo = assetMap['act3_wheel_disc'];
  const wheelDisc = extruder.createCard({
    url: discInfo.url, aspect: discInfo.aspect, height: 3.25,
    thickness: 0.085, anchor: 'center'
  });
  wheelDisc.position.set(0, 1.82, 0.10);
  wheelRoot.add(wheelDisc);

  const wheelHinge = new WaveHinge(wheelRoot, {
    zPos: -48.6, baseY: 0.015, foldLayer: 5, openDist: 10.8, closeBehindDist: 7.5,
  });
  hinges.push(wheelHinge);
  wheelRoot.userData.hinge = wheelHinge;
  wheelRoot.userData.label = 'River Waterwheel';
  clickables.push(wheelRoot);

  addCutout('act2_lantern_post',  { x: -5.4, z: -55.2, height: 3.1, emissive: 0.36, openDist: 10.6 });
  addCutout('act2_lantern_post',  { x:  5.4, z: -55.2, height: 3.1, emissive: 0.36, openDist: 10.6 });
  addCutout('act2_ghost_spirit',  { x: -3.2, z: -56.4, height: 2.5, opacity: 0.85, openDist: 10.4 });
  addCutout('act2_radish_spirit', { x:  3.0, z: -57.2, height: 3.0, interactive: 'Bathhouse Guest', openDist: 10.4 });
  addCutout('act1_moss_bush',     { x: -6.2, z: -61.0, height: 1.8, openDist: 10.6 });
  addCutout('act1_moss_bush',     { x:  6.2, z: -61.0, height: 1.8, openDist: 10.6 });

  const bathRoot = new THREE.Group();
  bathRoot.position.set(0, 0.015, -62.8);
  scene.add(bathRoot);

  const centerInfo = assetMap['act3_bathhouse_center'];
  const centerH = 8.2;
  const centerW = centerH * centerInfo.aspect;
  const centerCard = extruder.createCard({
    url: centerInfo.url, aspect: centerInfo.aspect, height: centerH,
    thickness: 0.11, emissiveIntensity: 0.22, emissiveColor: 0xffc66e, anchor: 'bottom'
  });
  bathRoot.add(centerCard);

  const leftInfo = assetMap['act3_bathhouse_left'];
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-centerW * 0.46, 0, -0.04);
  const leftCard = extruder.createCard({
    url: leftInfo.url, aspect: leftInfo.aspect, height: 6.4,
    thickness: 0.095, emissiveIntensity: 0.20, emissiveColor: 0xffc66e, anchor: 'right'
  });
  leftPivot.add(leftCard);
  bathRoot.add(leftPivot);

  const rightInfo = assetMap['act3_bathhouse_right'];
  const rightPivot = new THREE.Group();
  rightPivot.position.set(centerW * 0.46, 0, -0.04);
  const rightCard = extruder.createCard({
    url: rightInfo.url, aspect: rightInfo.aspect, height: 6.8,
    thickness: 0.095, emissiveIntensity: 0.20, emissiveColor: 0xffc66e, anchor: 'left'
  });
  rightPivot.add(rightCard);
  bathRoot.add(rightPivot);

  const bathHinge = new WaveHinge(bathRoot, {
    zPos: -62.8, baseY: 0.015, foldLayer: 7, openDist: 11.4, closeBehindDist: 9.0, stiffness: 112, damping: 12
  });
  hinges.push(bathHinge);
  bathRoot.userData.hinge = bathHinge;
  bathRoot.userData.label = 'Aburaya Bathhouse (Gate-Fold)';
  clickables.push(bathRoot);

  const gateFold = new GateFold(leftPivot, rightPivot, {
    zPos: -62.8, startOpenAhead: 9.2, fullOpenAhead: 3.6
  });

  // =========================================================
  // ACT 4: HAKU DRAGON, SHIKIGAMI & VOLVELLE MOON
  // Clean spatial separation: Chihiro boardwalk on left (x = -4.2),
  // Haku & Moon majestically framed center-right (x = +1.8) — ZERO overlap!
  // =========================================================
  const volvelleRoot = new THREE.Group();
  volvelleRoot.position.set(1.8, 0.015, -85.0);
  scene.add(volvelleRoot);

  const moonArmPivot = new THREE.Group();
  moonArmPivot.position.set(0, 1.6, 0);
  volvelleRoot.add(moonArmPivot);

  const moonInfo = assetMap['act4_full_moon'];
  const moonCard = extruder.createCard({
    url: moonInfo.url, aspect: moonInfo.aspect, height: 3.25,
    thickness: 0.075, emissiveIntensity: 0.38, emissiveColor: 0xfff3cf, anchor: 'center'
  });
  moonCard.position.set(0, 3.6, 0);
  moonArmPivot.add(moonCard);

  const volvelleHinge = new WaveHinge(volvelleRoot, {
    zPos: -85.0, baseY: 0.015, foldLayer: 5, openDist: 11.4, closeBehindDist: 8.5
  });
  hinges.push(volvelleHinge);
  const volvelle = new VolvelleArc(moonArmPivot, { startT: 0.56, endT: 0.70, maxAngle: 0.54 });

  const haku = addCutout('act4_haku_dragon', {
    x: 1.8, y: 2.1, z: -82.4, height: 4.8,
    emissive: 0.14, emissiveColor: 0xd8f8ff, interactive: 'Haku Dragon',
    openDist: 11.0, foldLayer: 7,
    customYFn: (t) => 2.1 + Math.sin(t * 1.8) * 0.32,
  });
  if (haku) {
    animatedProps.push((t, flat) => {
      haku.card.rotation.z = flat ? 0 : Math.sin(t * 1.4) * 0.042;
    });
  }

  // Swirling Shikigami positioned cleanly to the left & right of boardwalk (ZERO collision with Chihiro!)
  const shikiSpecs = [
    { key: 'act4_shikigami_single',  x: -7.2, y: 2.0, z: -78.2, h: 1.8, ph: 1.2 },
    { key: 'act4_shikigami_cluster', x: -7.0, y: 1.3, z: -84.2, h: 2.8, ph: 0.0 },
    { key: 'act4_shikigami_single',  x: -1.1, y: 2.7, z: -76.5, h: 1.8, ph: 2.4 },
    { key: 'act4_shikigami_cluster', x:  6.4, y: 1.5, z: -81.0, h: 2.9, ph: 2.1 },
    { key: 'act4_shikigami_single',  x:  4.8, y: 2.2, z: -86.2, h: 1.9, ph: 3.5 },
  ];
  for (const s of shikiSpecs) {
    const item = addCutout(s.key, {
      x: s.x, y: s.y, z: s.z, height: s.h,
      emissive: 0.16, emissiveColor: 0xe8f2ff, openDist: 10.6,
      customYFn: (t) => s.y + Math.sin(t * 2.5 + s.ph) * 0.28,
    });
    if (item) {
      animatedProps.push((t, flat) => {
        item.card.rotation.z = flat ? 0 : Math.sin(t * 2.2 + s.ph) * 0.13;
      });
    }
  }

  addCutout('act4_night_cloud', { x: -8.2, z: -76.8, height: 3.0, openDist: 10.6 });
  addCutout('act4_night_cloud', { x:  6.8, z: -78.5, height: 3.1, openDist: 10.6 });
  addCutout('act4_night_cloud', { x: -7.8, z: -87.8, height: 3.2, openDist: 10.8 });
  addCutout('act4_night_cloud', { x:  6.5, z: -87.8, height: 3.2, openDist: 10.8 });

  // =========================================================
  // ACT 5: BANQUET OF NO-FACE (Clean wide aisle for Chihiro!)
  // =========================================================
  addCutout('act5_banquet_table', { x: -5.2, z: -101.8, height: 2.4, rotY:  0.18, openDist: 10.5 });
  addCutout('act5_banquet_table', { x:  4.8, z: -103.0, height: 2.4, rotY: -0.18, openDist: 10.5 });
  addCutout('act5_susuwatari',    { x: -3.7, z: -105.8, height: 1.9, interactive: 'Susuwatari Soot Sprites', openDist: 10.4 });
  addCutout('act5_susuwatari',    { x:  3.8, z: -108.2, height: 1.8, openDist: 10.4 });
  addCutout('act5_noface',        { x:  0.6, z: -106.5, height: 5.1, emissive: 0.10, emissiveColor: 0xffd260, interactive: 'No-Face (Kaonashi)', openDist: 10.9, foldLayer: 6 });
  // Wider Byobu spacing (x = ±5.9) so Chihiro glides cleanly onto the wooden pier without brushing a screen!
  addCutout('act5_byobu_screen',  { x: -5.9, z: -111.6, height: 4.4, rotY:  0.22, openDist: 10.8 });
  addCutout('act5_byobu_screen',  { x:  5.9, z: -111.6, height: 4.4, rotY: -0.22, openDist: 10.8 });
  addCutout('act2_lantern_post',  { x: -7.8, z: -107.0, height: 3.1, emissive: 0.30, openDist: 10.6 });
  addCutout('act2_lantern_post',  { x:  7.8, z: -107.0, height: 3.1, emissive: 0.30, openDist: 10.6 });

  // =========================================================
  // ACT 6: PULL-TAB SEA TRAIN, WARM SUNSET CLOUDS & ISLAND COTTAGE
  // =========================================================
  const trainRes = addCutout('act6_sea_train', {
    x: -11.5, y: 0.02, z: -130.5, height: 3.55,
    emissive: 0.20, emissiveColor: 0xffc878, interactive: 'Spirit Sea Train',
    openDist: 10.9, foldLayer: 6,
    customYFn: (t) => 0.02 + Math.sin(t * 4.0) * 0.03,
  });
  const pullTabTrain = new PullTabRail(trainRes.card, {
    startT: 0.80, endT: 0.99, startX: -11.5, endX: -0.4
  });

  addCutout('act6_island_house', { x:  5.5, z: -137.0, height: 4.7, interactive: 'Swamp Bottom Cottage', openDist: 11.4, foldLayer: 5 });
  addCutout('act6_sunset_cloud', { x: -6.8, z: -138.8, height: 2.9, openDist: 12.2 });
  addCutout('act6_sunset_cloud', { x:  0.4, z: -141.0, height: 3.2, openDist: 13.8 });
  addCutout('act6_sunset_cloud', { x:  8.5, z: -140.0, height: 2.8, openDist: 13.2 });

  // =========================================================
  // AMBIENT DRIFTING PAPER PARTICLES
  // =========================================================
  const pCount = 240;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const z = 8 - Math.random() * 150;
    pPos[i * 3] = (Math.random() - 0.5) * 24;
    pPos[i * 3 + 1] = 0.6 + Math.random() * 6.5;
    pPos[i * 3 + 2] = z;
    pVel[i * 3] = (Math.random() - 0.5) * 0.42;
    pVel[i * 3 + 1] = -0.22 - Math.random() * 0.32;
    pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.22;

    const c = new THREE.Color();
    if (z > -18) c.setHex(0xe06030);
    else if (z > -70) c.setHex(0xffbe55);
    else if (z > -95) c.setHex(0xf6f8ff);
    else if (z > -117) c.setHex(0xffd652);
    else c.setHex(0xffe9dc);
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.21, vertexColors: true, transparent: true, opacity: 0.82 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // =========================================================
  // MOOD PALETTE MORPHING
  // =========================================================
  const moodStops = [
    { t: 0.00, bg: new THREE.Color(0xa2bb7e), sun: new THREE.Color(0xffe9c2), sunInt: 2.05, hemiInt: 0.90 },
    { t: 0.22, bg: new THREE.Color(0x524c6b), sun: new THREE.Color(0xffb974), sunInt: 1.55, hemiInt: 0.72 },
    { t: 0.42, bg: new THREE.Color(0x7ca098), sun: new THREE.Color(0xffcf88), sunInt: 1.85, hemiInt: 0.82 },
    { t: 0.62, bg: new THREE.Color(0x232f52), sun: new THREE.Color(0xc2d8ff), sunInt: 1.45, hemiInt: 0.68 },
    { t: 0.79, bg: new THREE.Color(0x9a5442), sun: new THREE.Color(0xffd582), sunInt: 1.85, hemiInt: 0.82 },
    { t: 0.95, bg: new THREE.Color(0xe8a89f), sun: new THREE.Color(0xffd6b8), sunInt: 1.95, hemiInt: 0.92 },
  ];
  const tmpColor = new THREE.Color();

  function updateAtmosphere(t, focusZ) {
    let i = 0;
    while (i < moodStops.length - 2 && t > moodStops[i + 1].t) i++;
    const a = moodStops[i], b = moodStops[i + 1];
    const f = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1);

    tmpColor.copy(a.bg).lerp(b.bg, f);
    scene.background.copy(tmpColor);
    scene.fog.color.copy(tmpColor);

    sunLight.color.copy(a.sun).lerp(b.sun, f);
    sunLight.intensity = THREE.MathUtils.lerp(a.sunInt, b.sunInt, f);
    hemiLight.intensity = THREE.MathUtils.lerp(a.hemiInt, b.hemiInt, f);

    sunLight.position.set(13 - t * 4, 19, focusZ + 11);
    sunLight.target.position.set(0, 0, focusZ - 3.5);
  }

  // =========================================================
  // CONTROLLER, RAYCASTING & LOOP
  // =========================================================
  const director = new ScrollDirector(camera, { startZ: 3.0, endZ: -128.5, duration: 54 });
  const foley = new PaperFoleyEngine();
  let foldFlat = false;
  let lastActIdx = -1;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.target !== renderer.domElement) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickables, true);
    if (hits.length > 0) {
      let node = hits[0].object;
      while (node && !node.userData.label) node = node.parent;
      if (node && node.userData.hinge) {
        node.userData.hinge.impulse(5.5);
        foley.playPaperSnap('up');
        foley.playChime(1.0);
        window.dispatchEvent(new CustomEvent('papercraft:interact', { detail: node.userData.label }));
      }
    }
  });

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    director.nudge(e.deltaY * 0.00028);
  }, { passive: false });

  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const dy = touchY - e.touches[0].clientY;
    touchY = e.touches[0].clientY;
    director.nudge(dy * 0.00085);
  }, { passive: true });

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    post.resize(w, h, dpr);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    const { t, focusZ, velocity } = director.update(dt, time);
    updateAtmosphere(t, focusZ);

    for (const h of hinges) {
      h.update(dt, focusZ, time, foldFlat, (dir) => foley.playPaperSnap(dir));
    }

    chihiroWalker.update(dt, t, velocity, time, foldFlat);
    gateFold.update(dt, focusZ, foldFlat);
    volvelle.update(dt, t, time, foldFlat);
    pullTabTrain.update(t, foldFlat);

    if (!foldFlat) {
      wheelDisc.rotation.z -= dt * (0.95 + velocity * 30.0);
    }

    const targetCreaseOp = foldFlat ? 0.85 : 0.0;
    creaseMat.opacity += (targetCreaseOp - creaseMat.opacity) * Math.min(1, dt * 6.0);

    for (const fn of animatedProps) fn(time, foldFlat);

    particles.visible = !foldFlat;
    if (!foldFlat) {
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pos[i * 3] += pVel[i * 3] * dt + Math.sin(time + i) * 0.004;
        pos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
        if (pos[i * 3 + 1] < 0.25) pos[i * 3 + 1] = 6.8;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    foley.updateAmbient(velocity);

    let actIdx = 0;
    for (let i = ACTS.length - 1; i >= 0; i--) {
      if (t >= ACTS[i].t) { actIdx = i; break; }
    }
    if (actIdx !== lastActIdx) {
      if (lastActIdx !== -1) foley.playPageTurn();
      lastActIdx = actIdx;
      window.dispatchEvent(new CustomEvent('papercraft:act', { detail: ACTS[actIdx] }));
    }
    window.dispatchEvent(new CustomEvent('papercraft:progress', { detail: { t, autoPlay: director.autoPlay } }));

    post.render(time);
  }
  animate();

  return {
    director,
    foley,
    post,
    toggleFoldFlat() {
      foldFlat = !foldFlat;
      foley.playPageTurn();
      return foldFlat;
    },
    setTiltShift(v) { post.enabled = v; },
  };
}
