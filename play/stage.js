/* 3D stage for Game Mode: title screen + cinematic pull reveals.
   Original scene built from simple shapes; exposes window.STAGE. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('stage3d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0b0c, 24, 55);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
let zoomK = 1;
const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); zoomK = camera.aspect < 1.2 ? Math.min(1.9, 1.35 / camera.aspect) : 1; if (window.__layoutBanners) window.__layoutBanners(); };
addEventListener('resize', size);

/* ---------- helpers ---------- */
const cnv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const std = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .15, ...opts });
const LIME = 0xdcfe1c, PINK = 0xff7a1a, CYAN = 0xdcfe1c;

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0x9a9aa3, 0x111113, .9));
const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 12, 10); scene.add(key);
const pl1 = new THREE.PointLight(LIME, 30, 30); pl1.position.set(-6, 5, 3); scene.add(pl1);
const pl2 = new THREE.PointLight(PINK, 30, 30); pl2.position.set(6, 5, 3); scene.add(pl2);
const spot = new THREE.SpotLight(0xffffff, 120, 30, .5, .5); spot.position.set(0, 12, 3); spot.target.position.set(0, 1, 0); scene.add(spot, spot.target);

/* ---------- floor + stepped stage ---------- */
const gridTex = cnv(1024, 1024, (g, w, h) => {
  g.fillStyle = '#141416'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(220,254,28,.16)'; g.lineWidth = 2;
  for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); }
});
gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(4, 4);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: gridTex, roughness: .9 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const steps = [[4.6, .22, 0x1c1c1f], [3.8, .5, 0x2a2a2e], [3.0, .8, 0x3a3a3f]];
steps.forEach(([r, h, c]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 6), std(c)); m.position.y = h / 2; m.rotation.y = Math.PI / 6; scene.add(m); });
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.02, .05, 8, 6), new THREE.MeshBasicMaterial({ color: LIME }));
ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI / 6; ring.position.y = .81; scene.add(ring);

/* ---------- speaker stacks ---------- */
const spkTex = cnv(256, 256, (g, w, h) => {
  g.fillStyle = '#1a1a1c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#dcfe1c'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  [[w / 2, h * .62, 70], [w / 2, h * .22, 30]].forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, '#3a3d4d'); gr.addColorStop(.55, '#22242f'); gr.addColorStop(1, '#4b4f62');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#9aa0b6'; g.lineWidth = 4; g.stroke();
  });
});
const spkMat = [std(0x1d1d20), std(0x1d1d20), std(0x1d1d20), std(0x1d1d20), new THREE.MeshStandardMaterial({ map: spkTex, roughness: .6 }), std(0x1d1d20)];
const speakers = new THREE.Group();
[[-1, 1], [1, -1]].forEach(([side, rot]) => {
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.4), spkMat);
    b.position.set(side * (6.2 + j * 1.9), .9 + i * 1.85, -3.4 - j * .6); b.rotation.y = rot * .35; speakers.add(b);
  }
});
scene.add(speakers);

/* ---------- back wall with logo posters ---------- */
const wallTex = cnv(1024, 512, (g, w, h) => {
  g.fillStyle = '#101012'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2;
  for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let x = -h; x < w; x += 40) { g.fillStyle = (x / 40 | 0) % 2 ? '#dcfe1c' : '#111'; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 20, h); g.lineTo(x + 50, h - 30); g.lineTo(x + 30, h - 30); g.fill(); } g.fillStyle = 'rgba(255,122,26,.85)'; g.fillRect(0, 16, w, 6);
});
const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshStandardMaterial({ map: wallTex, roughness: .9 }));
wall.position.set(0, 7.5, -7.5); scene.add(wall);
const posters = [];
const avatarTex = new THREE.TextureLoader().load(window.AVATAR || ''); avatarTex.colorSpace = THREE.SRGBColorSpace;
[-1, 1].forEach(s => {
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.6), new THREE.MeshBasicMaterial({ color: s < 0 ? 0xdcfe1c : 0xff7a1a }));
  bg.position.set(s * 3.4, 6.2, -7.4);
  const lg = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshBasicMaterial({ map: avatarTex }));
  lg.position.set(s * 3.4, 6.4, -7.38); scene.add(bg, lg); posters.push(bg);
});

/* ---------- overhead truss + light beams ---------- */
const truss = new THREE.Group();
const bar = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(0x48484e, { metalness: .7, roughness: .3 })); m.position.set(x, y, z); truss.add(m); };
bar(10, .25, .25, 0, 9, -3); bar(10, .25, .25, 0, 9, 3); bar(.25, .25, 6, -5, 9, 0); bar(.25, .25, 6, 5, 9, 0);
const strip = new THREE.Mesh(new THREE.BoxGeometry(9.4, .06, .06), new THREE.MeshBasicMaterial({ color: LIME })); strip.position.set(0, 8.85, 3); truss.add(strip);
scene.add(truss);
const beams = [];
const beamMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
[[-4, LIME], [-1.4, CYAN], [1.4, PINK], [4, LIME]].forEach(([x, c], i) => {
  const g = new THREE.ConeGeometry(1.6, 9, 24, 1, true); g.translate(0, -4.5, 0);
  const m = new THREE.Mesh(g, beamMat(c)); m.position.set(x, 9, 0); m.userData.ph = i * 1.7; scene.add(m); beams.push(m);
});

/* ---------- hero card ---------- */
const hero = new THREE.Group(); hero.position.set(0, 3.1, 0); scene.add(hero);
const frameMat = new THREE.MeshBasicMaterial({ color: LIME });
const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), frameMat);
const cardMat = new THREE.MeshBasicMaterial({ map: avatarTex, side: THREE.DoubleSide });
const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cardMat); card.position.z = .02;
const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x15161d })); back.position.z = -.01; back.rotation.y = Math.PI;
hero.add(frame, card, back);
const setCardSize = (w, h) => { const H = 3.6, W = Math.min(3.4, H * w / h); card.scale.set(W, W * h / w > H ? H : W * h / w, 1); frame.scale.set(card.scale.x + .22, card.scale.y + .22, 1); back.scale.copy(frame.scale); };
setCardSize(1, 1);
const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
const setHeroImage = (src, rankColor) => new Promise(res => {
  frameMat.color.set(rankColor);
  const done = t => { t.colorSpace = THREE.SRGBColorSpace; cardMat.map = t; cardMat.needsUpdate = true; const im = t.image; setCardSize(im.width || 1, im.height || 1); res(); };
  if (!src) return done(avatarTex);
  loader.load(src, done, undefined, () => done(avatarTex));
});

/* sparkles around the hero */
const SPN = 160, spPos = new Float32Array(SPN * 3), spCol = new Float32Array(SPN * 3);
const spCols = [LIME, PINK, CYAN, 0xffc444, 0xffffff].map(c => new THREE.Color(c));
for (let i = 0; i < SPN; i++) { const a = Math.random() * 6.28, r = 2 + Math.random() * 5; spPos.set([Math.cos(a) * r, Math.random() * 9, Math.sin(a) * r * .6], i * 3); const c = spCols[i % spCols.length]; spCol.set([c.r, c.g, c.b], i * 3); }
const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3)); spGeo.setAttribute('color', new THREE.BufferAttribute(spCol, 3));
const sparkTex = cnv(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: .28, map: sparkTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
sparks.visible = false; scene.add(sparks);

/* ---------- giant curved 3D text banners ---------- */
const bannerTex = (big, small, rainbow) => cnv(2048, 640, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const drawLine = (txt, font, y, topFill) => {
    g.font = font;
    for (let i = 22; i > 0; i--) { g.fillStyle = i > 18 ? '#0d0e14' : `rgb(${40 + i},${42 + i},${56 + i})`; g.fillText(txt, w / 2 + i * 1.3, y + i * 1.7); }
    g.lineWidth = 10; g.strokeStyle = '#15161d'; g.strokeText(txt, w / 2, y); g.fillStyle = topFill; g.fillText(txt, w / 2, y);
  };
  let fill = '#ffffff';
  if (rainbow) { const gr = g.createLinearGradient(w * .15, 0, w * .85, 0); ['#ff4f4f', '#ffb400', '#d9ff3c', '#38e1ff', '#7a6cff', '#ff4fd8'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c)); fill = gr; }
  let fs = 330; g.font = `${fs}px "Bebas Neue", Impact, sans-serif`; while (g.measureText(big).width > w * .9 && fs > 120) { fs -= 10; g.font = `${fs}px "Bebas Neue", Impact, sans-serif`; }
  drawLine(big, `${fs}px "Bebas Neue", Impact, sans-serif`, 360, fill);
  drawLine(small, '900 120px "Noto Sans JP", "Chakra Petch", sans-serif', 560, '#d9ff3c');
});
const bentPlane = (w, h, bend) => { const g = new THREE.PlaneGeometry(w, h, 40, 4); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, x * x * bend); } g.computeVertexNormals(); return g; };
const bannerMat = side => new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
const leftB = new THREE.Mesh(bentPlane(9, 2.8, .045), bannerMat()); const rightB = new THREE.Mesh(bentPlane(9, 2.8, .045), bannerMat());
leftB.userData.home = { p: new THREE.Vector3(-6.6, 4.4, 1.6), r: new THREE.Euler(0, .62, .14) };
rightB.userData.home = { p: new THREE.Vector3(6.6, 3.7, 1.6), r: new THREE.Euler(0, -.62, -.1) };
const layoutBanners = () => {
  const port = camera.aspect < 1.2;
  leftB.userData.home = port ? { p: new THREE.Vector3(0, 7.9, 2.2), r: new THREE.Euler(-.08, 0, .05) } : { p: new THREE.Vector3(-6.6, 4.4, 1.6), r: new THREE.Euler(0, .62, .14) };
  rightB.userData.home = port ? { p: new THREE.Vector3(0, -.2, 5.2), r: new THREE.Euler(-.25, 0, -.05) } : { p: new THREE.Vector3(6.6, 3.7, 1.6), r: new THREE.Euler(0, -.62, -.1) };
  [leftB, rightB].forEach(b => { b.position.copy(b.userData.home.p); b.rotation.copy(b.userData.home.r); b.scale.setScalar(port ? .85 : 1); });
};
window.__layoutBanners = layoutBanners;
[leftB, rightB].forEach(b => { b.renderOrder = 5; scene.add(b); });
size();
const setBanners = (l, r, rainbow) => {
  [[leftB, l], [rightB, r]].forEach(([b, [big, small]]) => { if (b.material.map) b.material.map.dispose(); b.material.map = bannerTex(big, small, rainbow); b.material.needsUpdate = true; });
};

/* ---------- camera choreography ---------- */
const target = new THREE.Vector3(0, 3, 0);
let mode = 'off', t0 = performance.now(), cine = null, shakeAmt = 0, mx = 0, my = 0;
addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
const ease = x => 1 - Math.pow(1 - x, 3), back2 = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const camAt = (ang, rad, y) => { camera.position.set(Math.sin(ang) * rad, y, Math.cos(ang) * rad); camera.lookAt(target); };

const fontsReady = document.fonts ? Promise.all([document.fonts.load('330px "Bebas Neue"'), document.fonts.load('900 120px "Noto Sans JP"')]).catch(() => {}) : Promise.resolve();
fontsReady.then(() => { if (!cine) setBanners(['AHBANGKUN', 'デジタルクリエイター'], ['GAME MODE', 'ようこそ!']); });
setBanners(['AHBANGKUN', 'デジタルクリエイター'], ['GAME MODE', 'ようこそ!']);

let last = performance.now();
const frameLoop = now => {
  requestAnimationFrame(frameLoop);
  const dt = Math.min((now - last) / 1000, .05); last = now;
  if (mode === 'off' && !cine) return;
  const t = (now - t0) / 1000;
  beams.forEach(b => { b.rotation.z = Math.sin(t * .6 + b.userData.ph) * .32; b.rotation.x = Math.cos(t * .45 + b.userData.ph) * .18; });
  hero.position.y = 3.1 + Math.sin(t * 1.6) * .08;
  sparks.rotation.y += dt * .25;
  if (cine) {
    const k = Math.min(1, (now - cine.start) / cine.dur);
    // spin in: from high behind, around and down to the front
    const e = ease(k);
    camAt(THREE.MathUtils.lerp(-Math.PI * 1.35, 0, e), THREE.MathUtils.lerp(26, 11.5, e) * zoomK, THREE.MathUtils.lerp(13, 3.2, e));
    hero.rotation.y = (1 - e) * Math.PI * 4;
    const hk = THREE.MathUtils.clamp((k - .35) / .4, 0, 1); hero.scale.setScalar(Math.max(.001, back2(hk)));
    const bk = THREE.MathUtils.clamp((k - .55) / .35, 0, 1);
    [leftB, rightB].forEach((b, i) => { const s = i ? 1 : -1, h = b.userData.home; b.position.set(h.p.x + s * (1 - ease(bk)) * 14, h.p.y, h.p.z); b.material.opacity = bk; });
    if (k >= 1 && !cine.landed) { cine.landed = true; shakeAmt = 1; cine.onLand && cine.onLand(); }
    if (cine.landed && now - cine.start > cine.dur + cine.hold) { const cb = cine.cb; cine = null; canvas.classList.remove('top'); hero.rotation.y = 0; if (cb) cb(); applyMode(); }
  } else {
    const sway = reduced ? 0 : Math.sin(t * .22) * .55;
    camAt(sway + mx * .12, (mode === 'title' ? 12.5 : 14) * zoomK, 3.4 - my * .4 + Math.sin(t * .3) * .15);
    hero.rotation.y = Math.sin(t * .5) * .35; hero.scale.setScalar(1);
    [leftB, rightB].forEach(b => { b.position.copy(b.userData.home.p); b.material.opacity = 1; });
  }
  if (shakeAmt > 0) { camera.position.x += (Math.random() - .5) * shakeAmt * .5; camera.position.y += (Math.random() - .5) * shakeAmt * .5; camera.rotation.z += (Math.random() - .5) * shakeAmt * .04; shakeAmt = Math.max(0, shakeAmt - dt * 1.8); }
  renderer.render(scene, camera);
};
requestAnimationFrame(frameLoop);

const applyMode = () => {
  canvas.classList.toggle('on', mode !== 'off'); canvas.classList.toggle('dim', mode === 'lobby');
  if (mode === 'title') { setHeroImage(window.AVATAR, LIME); setBanners(['AHBANGKUN', 'デジタルクリエイター'], ['GAME MODE', 'ようこそ!']); sparks.visible = false; }
};

window.STAGE = {
  ready: true,
  mode(m) { if (m === mode) return; mode = m; if (!cine) applyMode(); },
  skip() { if (cine) { cine.start = performance.now() - cine.dur - cine.hold - 1; if (!cine.landed) { cine.landed = true; cine.onLand && cine.onLand(); } } },
  async reveal({ img, rank }, cb, onLand) {
    const sss = rank === 6;
    await setHeroImage(img, sss ? 0xff4fd8 : rank === 5 ? 0xffc444 : 0xb384ff);
    setBanners(sss ? ['SSS', '伝説召喚'] : ['★5 PULL', '超レア'], sss ? ['LEGENDARY', 'PULL GET!'] : ['SUPER RARE', '召喚成功'], sss);
    sparks.visible = true; hero.scale.setScalar(.001);
    canvas.classList.add('on', 'top'); canvas.classList.remove('dim');
    cine = { start: performance.now(), dur: 2300, hold: sss ? 1700 : 1200, cb, onLand };
  }
};
canvas.addEventListener('click', () => window.STAGE.skip());
document.dispatchEvent(new Event('stage-ready'));
