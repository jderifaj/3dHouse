import * as THREE from 'three';

export function createRenderer(wrap) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  wrap.appendChild(renderer.domElement);
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x24365c, 0.024);
  return scene;
}

export function createCamera() {
  return new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
}

export function addLights(scene) {
  const moon = new THREE.DirectionalLight(0x9fbde0, 0.9);
  moon.position.set(-6, 14, 10);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -12;
  moon.shadow.camera.right = 12;
  moon.shadow.camera.top = 12;
  moon.shadow.camera.bottom = -12;
  moon.shadow.bias = -0.0015;
  scene.add(moon);

  const hemi = new THREE.HemisphereLight(0x8fb0da, 0x1a2338, 0.6);
  scene.add(hemi);

  const fill = new THREE.PointLight(0xffd8a8, 0.5, 22);
  fill.position.set(2, 2, 10);
  scene.add(fill);
}

export function addGround(scene) {
  const groundGeo = new THREE.CircleGeometry(26, 48);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xdfe9f4, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -3.35;
  ground.receiveShadow = true;
  scene.add(ground);

  for (let r = 0; r < 3; r++) {
    const ringGeo = new THREE.RingGeometry(8 + r * 4, 8.05 + r * 4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xcfe0f0, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -3.33;
    scene.add(ring);
  }
}

export function createSnow(scene) {
  const SNOW_COUNT = 260;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(SNOW_COUNT * 3);
  const snowSpeed = new Float32Array(SNOW_COUNT);
  for (let s = 0; s < SNOW_COUNT; s++) {
    snowPos[s * 3] = (Math.random() - 0.5) * 22;
    snowPos[s * 3 + 1] = Math.random() * 14 - 2;
    snowPos[s * 3 + 2] = (Math.random() - 0.5) * 18 + 3;
    snowSpeed[s] = 0.01 + Math.random() * 0.02;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.85 });
  const snowPoints = new THREE.Points(snowGeo, snowMat);
  scene.add(snowPoints);

  function update(dt) {
    const pos = snowGeo.attributes.position.array;
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3 + 1] -= snowSpeed[i] * 60 * dt;
      if (pos[i * 3 + 1] < -3.3) pos[i * 3 + 1] = 10 + Math.random() * 2;
    }
    snowGeo.attributes.position.needsUpdate = true;
  }

  return { update };
}

export function bindResize(camera, renderer) {
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
