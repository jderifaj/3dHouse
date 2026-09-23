import * as THREE from 'three';
import {
  makeShiplapTexture,
  makeCinderblockTexture,
  makeBrickTexture,
  makeHardwoodTexture,
} from './textures.js';

export function createMaterials() {
  return {
    shiplapMat: new THREE.MeshStandardMaterial({ map: makeShiplapTexture(), roughness: 0.85, side: THREE.DoubleSide }),
    cinderMat: new THREE.MeshStandardMaterial({ map: makeCinderblockTexture(), roughness: 1, side: THREE.DoubleSide }),
    brickMat: new THREE.MeshStandardMaterial({ map: makeBrickTexture(), roughness: 0.95 }),
    hardwoodMat: new THREE.MeshStandardMaterial({ map: makeHardwoodTexture(), roughness: 0.55 }),
    wallMat: new THREE.MeshStandardMaterial({ color: 0xE9EEF4, roughness: 0.9, side: THREE.DoubleSide }),
    floorMat: new THREE.MeshStandardMaterial({ color: 0x8a6a4d, roughness: 0.85 }),
    stoneMat: new THREE.MeshStandardMaterial({ color: 0x5c6577, roughness: 1 }),
    roofMat: new THREE.MeshStandardMaterial({ color: 0x3b4a5e, roughness: 0.75 }),
    snowRoofMat: new THREE.MeshStandardMaterial({ color: 0xf0f4f9, roughness: 0.55 }),
    trimMat: new THREE.MeshStandardMaterial({ color: 0x6b4a34, roughness: 0.8 }),
    beamMat: new THREE.MeshStandardMaterial({ color: 0x8a6a4d, roughness: 1 }),
  };
}
