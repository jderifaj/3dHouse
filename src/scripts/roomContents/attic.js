import * as THREE from 'three';
import { gsap } from 'gsap';
import { box } from '../three/primitives.js';
import { atticY, INSUL_WIDTH, HALF_D, ROLL_DURATION } from '../three/constants.js';

/** Builds the attic's rolled-out insulation (the "hero" mesh for the attic room). */
export function buildAttic(house) {
  const insulMat = new THREE.MeshStandardMaterial({ color: 0xEF6996, roughness: 1 });
  const insulation = new THREE.Mesh(new THREE.BoxGeometry(INSUL_WIDTH, 0.18, HALF_D * 2 - 0.06), insulMat);
  insulation.position.set(0, atticY + 0.16, 0);
  insulation.castShadow = true; insulation.receiveShadow = true;
  house.add(insulation);
  box(house, 0.55, 0.4, 0.4, 0x9c8267, -1.3, atticY + 0.35, 0.2);

  return { insulation };
}

/** Plays the "unroll the insulation left-to-right" reveal when the attic room is selected. */
export function playInsulationRollOut(insulation) {
  gsap.killTweensOf(insulation.scale);
  gsap.killTweensOf(insulation.position);
  insulation.scale.x = 0.004;
  insulation.position.x = INSUL_WIDTH / 2;
  const rollObj = { p: 0 };
  gsap.to(rollObj, {
    p: 1,
    duration: ROLL_DURATION,
    ease: 'power2.out',
    onUpdate: function () {
      insulation.scale.x = Math.max(0.004, rollObj.p);
      insulation.position.x = (INSUL_WIDTH / 2) * (1 - rollObj.p);
    },
  });
}
