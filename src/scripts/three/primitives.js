import * as THREE from 'three';

/** Adds a simple box mesh to `house` and returns it. */
export function box(house, w, h, d, color, x, y, z, rotY) {
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  if (rotY) m.rotation.y = rotY;
  m.castShadow = true; m.receiveShadow = true;
  house.add(m);
  return m;
}

/** Adds a simple cylinder mesh to `house` and returns it. */
export function cyl(house, rt, rb, h, color, x, y, z) {
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.15 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 16), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  house.add(m);
  return m;
}
