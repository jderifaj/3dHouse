import * as THREE from 'three';
import { gsap } from 'gsap';
import { box, cyl } from '../three/primitives.js';
import { basY } from '../three/constants.js';
import { createWaterDialDisplay } from '../three/textures.js';

const WATER_DIAL_WASTEFUL = 140; // typical factory-default setting
const WATER_DIAL_EFFICIENT = 120; // energy.gov's recommended low setting

/** Builds the furnace and water-heater room contents. */
export function buildBasement(house) {
  const furnaceBody = box(house, 0.7, 1.3, 0.7, 0x6b7280, 1.4, basY + 0.75, -0.3);
  box(house, 0.7, 0.12, 0.1, 0x33383f, 1.4, basY + 1.15, 0.06);
  box(house, 0.7, 0.12, 0.1, 0x33383f, 1.4, basY + 0.85, 0.06);
  box(house, 1.4, 0.16, 0.16, 0x8a93a1, 1.4, basY + 2.02, -0.3);

  const waterTank = cyl(house, 0.34, 0.34, 1.35, 0x6FA8D0, -1.4, basY + 0.75, -0.2);
  const waterTankBase = cyl(house, 0.36, 0.36, 0.1, 0x4a7ba0, -1.4, basY + 0.06, -0.2);
  box(house, 0.05, 0.5, 0.05, 0x9db2ce, -1.4, basY + 1.55, -0.2);

  // ---------- Small temperature dial, mounted on the tank's front face ----------
  const dialDisplay = createWaterDialDisplay();
  dialDisplay.draw(WATER_DIAL_WASTEFUL);

  const dialX = -1.4, dialY = basY + 0.98, dialZ = -0.2 + 0.34 + 0.005;
  const dialBezel = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 24),
    new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.4 })
  );
  dialBezel.position.set(dialX, dialY, dialZ);
  house.add(dialBezel);

  const dialScreenTex = new THREE.CanvasTexture(dialDisplay.canvas);
  const dialScreen = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 24),
    new THREE.MeshBasicMaterial({ map: dialScreenTex })
  );
  dialScreen.position.set(dialX, dialY, dialZ + 0.005);
  house.add(dialScreen);

  return { furnaceBody, waterTank, waterTankBase, dialDraw: dialDisplay.draw, dialScreenTex };
}

/**
 * Sweeps the water heater's dial from a typical wasteful factory setting
 * down to the efficient 120°F recommendation, replaying from the start each
 * time the water heater room is selected.
 */
export function playWaterDialSweep(dialDraw, dialScreenTex) {
  const proxy = { value: WATER_DIAL_WASTEFUL };
  gsap.killTweensOf(proxy);
  dialDraw(proxy.value);
  dialScreenTex.needsUpdate = true;
  gsap.to(proxy, {
    value: WATER_DIAL_EFFICIENT,
    duration: 2.2,
    delay: 0.5,
    ease: 'power1.inOut',
    onUpdate: function () {
      dialDraw(proxy.value);
      dialScreenTex.needsUpdate = true;
    },
  });
}
