import * as THREE from 'three';

const TREES = [
  { type: 'pine', x: -6.2, z: -3.5, s: 1.4 },
  { type: 'bare', x: -5.2, z: 1.6, s: 1.15, seed: 11 },
  { type: 'pine', x: 6.4, z: -2.2, s: 1.6 },
  { type: 'bare', x: 5.6, z: 2.7, s: 1.3, seed: 42 },
  { type: 'pine', x: -7.6, z: 3.9, s: 0.9 },
  { type: 'bare', x: -8.4, z: -1.4, s: 1.4, seed: 7 },
  { type: 'bare', x: 7.6, z: 0.4, s: 1.1, seed: 23 },
  { type: 'pine', x: 8.4, z: 4.6, s: 1.2 },
  { type: 'bare', x: -4.4, z: -5.4, s: 1.3, seed: 65 },
  { type: 'pine', x: 4.0, z: -5.8, s: 1.1 },
  { type: 'bare', x: 9.4, z: -4.2, s: 1.5, seed: 88 },
  { type: 'pine', x: -9.6, z: 0.8, s: 1.25 },
];

function makePineTree(x, z, scale) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3627, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 6), trunkMat);
  trunk.position.y = 0.25;
  trunk.castShadow = true;
  g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f4d3a, roughness: 0.9 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf3f7fb, roughness: 0.6 });
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55 - i * 0.14, 0.65, 8), leafMat);
    cone.position.y = 0.55 + i * 0.42;
    cone.castShadow = true;
    g.add(cone);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.13, 0.16, 8), snowMat);
    cap.position.y = 0.55 + i * 0.42 + 0.3;
    g.add(cap);
  }
  g.position.set(x, -3.35, z);
  g.scale.setScalar(scale);
  return g;
}

function makeBareTree(x, z, scale, seed) {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 1 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf3f7fb, roughness: 0.6 });
  const trunkH = 0.95;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, trunkH, 6), woodMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  let s = seed;
  function rnd(n) { s = (s * 9301 + 49297) % 233280; return (s / 233280) * n; }

  function addBranch(baseY, baseR, dirAngle, tilt, len, depth) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.55, baseR, len, 5), woodMat);
    branch.position.set(0, len / 2, 0);
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(dirAngle) * 0.02, baseY, Math.sin(dirAngle) * 0.02);
    pivot.rotation.z = Math.cos(dirAngle) * tilt;
    pivot.rotation.x = Math.sin(dirAngle) * tilt;
    pivot.add(branch);
    branch.castShadow = true;
    g.add(pivot);
    if (rnd(1) > 0.45) {
      const clump = new THREE.Mesh(new THREE.SphereGeometry(0.06 + rnd(0.03), 6, 6), snowMat);
      clump.position.set(Math.sin(dirAngle) * len * 0.75, baseY + Math.cos(tilt) * len * 0.95, Math.cos(dirAngle) * len * 0.4);
      g.add(clump);
    }
    if (depth > 0) {
      addBranch(baseY + len * 0.55, baseR * 0.6, dirAngle + 0.7, tilt * 0.8, len * 0.6, depth - 1);
      addBranch(baseY + len * 0.7, baseR * 0.6, dirAngle - 0.9, tilt * 1.1, len * 0.5, depth - 1);
    }
  }
  const branchCount = 5;
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2 + rnd(0.6);
    const tilt = 0.55 + rnd(0.35);
    const len = 0.4 + rnd(0.22);
    addBranch(trunkH * (0.55 + rnd(0.3)), 0.05, angle, tilt, len, 1);
  }
  g.position.set(x, -3.35, z);
  g.scale.setScalar(scale);
  return g;
}

export function addTrees(scene) {
  TREES.forEach(function (t) {
    scene.add(t.type === 'pine' ? makePineTree(t.x, t.z, t.s) : makeBareTree(t.x, t.z, t.s, t.seed));
  });
}
