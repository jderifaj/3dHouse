import * as THREE from 'three';
import { CHIMNEY_X, CHIMNEY_Z, CHIMNEY_TOP_Y } from './constants.js';

const SMOKE_COUNT = 16;

/** Builds the chimney's rising smoke puffs and returns an updater for the animate loop. */
export function createChimneySmoke(house) {
  const smokePuffs = [];
  const smokeBaseMat = new THREE.MeshBasicMaterial({ color: 0xcfd3d8, transparent: true, opacity: 0.5 });
  for (let sp = 0; sp < SMOKE_COUNT; sp++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.09 + Math.random() * 0.05, 7, 7), smokeBaseMat.clone());
    const age0 = sp / SMOKE_COUNT;
    puff.userData = {
      age: age0,
      speed: 0.16 + Math.random() * 0.07,
      drift: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2,
    };
    house.add(puff);
    smokePuffs.push(puff);
  }

  function update(dt) {
    smokePuffs.forEach(function (puff) {
      const d = puff.userData;
      d.age += dt * d.speed;
      if (d.age > 1) d.age -= 1;
      const riseH = 2.1;
      puff.position.set(
        CHIMNEY_X + Math.sin(d.age * 6 + d.wobble) * 0.12 + d.drift * d.age,
        CHIMNEY_TOP_Y + d.age * riseH,
        CHIMNEY_Z + Math.cos(d.age * 5 + d.wobble) * 0.1
      );
      const scale = 0.6 + d.age * 1.6;
      puff.scale.set(scale, scale, scale);
      puff.material.opacity = Math.max(0, 0.5 * (1 - d.age));
    });
  }

  return { update };
}
