import * as THREE from 'three';
import { Y_ATTIC_FLOOR } from '../three/constants.js';

/** Builds the attic ceiling fan and returns its spinning rotor group. */
export function buildCeilingFan(house, x, z, scale) {
  const fanMetalDark = new THREE.MeshStandardMaterial({ color: 0x2a231b, metalness: 0.75, roughness: 0.35 });
  const fanMetalBronze = new THREE.MeshStandardMaterial({ color: 0x6b4a2c, metalness: 0.6, roughness: 0.4 });
  const fanBladeWood = new THREE.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.55 });
  const fanBladeWoodDark = new THREE.MeshStandardMaterial({ color: 0x4a2e1a, roughness: 0.6 });

  const fanRoot = new THREE.Group();
  const ceilingY = Y_ATTIC_FLOOR - 0.06;
  fanRoot.position.set(x, ceilingY, z);
  fanRoot.scale.setScalar(scale);
  house.add(fanRoot);

  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.1, 24), fanMetalDark);
  canopy.position.y = -0.02;
  fanRoot.add(canopy);

  const downrod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 12), fanMetalDark);
  downrod.position.y = -0.32;
  fanRoot.add(downrod);

  const motorY = -0.66;
  const housingOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.28, 28), fanMetalBronze);
  housingOuter.position.y = motorY;
  fanRoot.add(housingOuter);

  const housingCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), fanMetalDark);
  housingCapTop.position.y = motorY + 0.14;
  fanRoot.add(housingCapTop);

  const housingCapBottom = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), fanMetalDark);
  housingCapBottom.rotation.x = Math.PI;
  housingCapBottom.position.y = motorY - 0.14;
  fanRoot.add(housingCapBottom);

  const rotor = new THREE.Group();
  rotor.position.y = motorY;
  fanRoot.add(rotor);

  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 24), fanMetalBronze);
  hubRing.rotation.x = Math.PI / 2;
  rotor.add(hubRing);

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, -0.16);
  bladeShape.quadraticCurveTo(0.55, -0.19, 1.15, -0.1);
  bladeShape.quadraticCurveTo(1.32, -0.02, 1.15, 0.1);
  bladeShape.quadraticCurveTo(0.55, 0.19, 0, 0.16);
  bladeShape.closePath();
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 });
  bladeGeo.center();

  const BLADE_COUNT = 5;
  for (let i = 0; i < BLADE_COUNT; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / BLADE_COUNT) * Math.PI * 2;

    const iron = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.05), fanMetalDark);
    iron.position.x = 0.42;
    pivot.add(iron);

    const blade = new THREE.Mesh(bladeGeo, i % 2 === 0 ? fanBladeWood : fanBladeWoodDark);
    blade.position.x = 1.18;
    blade.rotation.x = Math.PI / 2 + 0.11;
    pivot.add(blade);

    rotor.add(pivot);
  }

  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), fanMetalDark);
  chain.position.set(0.1, motorY - 0.22, 0.05);
  fanRoot.add(chain);

  fanRoot.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return rotor;
}
