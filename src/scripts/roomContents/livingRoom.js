import * as THREE from 'three';
import { gsap } from 'gsap';
import { box } from '../three/primitives.js';
import { midY, HALF_D, HALF_W, FP_X, FP_WALL_Z, CHIMNEY_X, CHIMNEY_CHASE_TOP_Y } from '../three/constants.js';
import { makeWindowSceneTexture, createThermostatDisplay } from '../three/textures.js';

function makePillow(house, x, y, z, color, rotY, sx, sy, sz) {
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), mat);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  m.castShadow = true; m.receiveShadow = true;
  house.add(m);
  return m;
}

function makeChair(house, x, z, rotY, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.85 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), mat);
  seat.position.y = 0.35;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), mat);
  back.position.set(0, 0.62, -0.225);
  g.add(back);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.55), mat);
  armL.position.set(-0.27, 0.48, 0);
  g.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.27;
  g.add(armR);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3627, roughness: 0.9 });
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function (p) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), legMat);
    leg.position.set(p[0], 0.15, p[1]);
    g.add(leg);
  });
  g.children.forEach(function (m) { m.castShadow = true; m.receiveShadow = true; });
  g.position.set(x, midY, z);
  g.rotation.y = rotY;
  g.scale.set(0.82, 0.82, 0.88);
  house.add(g);
  return g;
}

function makeFlameMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0xff9a45, emissive: 0xff6a1a, emissiveIntensity: 1.3, roughness: 1 });
}

/**
 * Builds the living room: hardwood floor, couch, thermostat, fireplace + flame
 * animation, carpet and armchairs, and the front window.
 *
 * Returns the handles other modules need: the thermostat mesh/texture (for
 * highlighting + the thermostat demo) and the chimney-chase top y (used by
 * the smoke-puff animation).
 */
export function buildLivingRoom(house, mats) {
  const hardwoodFloor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2 - 0.1, HALF_D * 2 - 0.1), mats.hardwoodMat);
  hardwoodFloor.rotation.x = -Math.PI / 2;
  hardwoodFloor.position.set(0, midY + 0.015, 0);
  hardwoodFloor.receiveShadow = true;
  house.add(hardwoodFloor);

  box(house, 1.6, 0.4, 0.65, 0xB5743F, -1.6, midY + 0.3, -0.75);
  box(house, 1.6, 0.44, 0.15, 0x9c6335, -1.6, midY + 0.56, -1.05);
  box(house, 0.75, 0.06, 0.75, 0xe4dccd, 1.4, midY + 0.32, -0.4);
  makePillow(house, -2.05, midY + 0.6, -0.88, 0x8E44AD, 0.3, 1.2, 0.85, 1.05);
  makePillow(house, -1.18, midY + 0.6, -0.88, 0xE8DCC8, -0.25, 1.1, 0.8, 1.0);
  // (round rug removed)

  // ---------- Thermostat with a digital LED-style readout ----------
  const thermostatDisplay = createThermostatDisplay();
  thermostatDisplay.draw(76);

  const thermoBezel = new THREE.Mesh(new THREE.CircleGeometry(0.18, 28), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.45 }));
  thermoBezel.position.set(-1.1, midY + 1.55, -HALF_D + 0.09);
  house.add(thermoBezel);
  const thermoScreenTex = new THREE.CanvasTexture(thermostatDisplay.canvas);
  const thermoScreen = new THREE.Mesh(new THREE.CircleGeometry(0.12, 28), new THREE.MeshBasicMaterial({ map: thermoScreenTex }));
  thermoScreen.position.set(-1.1, midY + 1.55, -HALF_D + 0.14);
  house.add(thermoScreen);

  // ---------- Fireplace (living room, against the back wall) ----------
  box(house, 1.35, 0.08, 0.6, 0x6b6f75, FP_X, midY + 0.04, FP_WALL_Z + 0.32); // hearth
  box(house, 1.05, 1.35, 0.28, 0x7a4a3a, FP_X, midY + 0.68, FP_WALL_Z + 0.16); // surround
  box(house, 1.3, 0.1, 0.42, 0x5c3d2a, FP_X, midY + 1.4, FP_WALL_Z + 0.21); // mantel
  box(house, 0.58, 0.68, 0.1, 0x1a1410, FP_X, midY + 0.45, FP_WALL_Z + 0.32); // firebox

  // flame glow flicker via a GSAP color tween on a plain material (no shader needed)
  const flames = [];
  const flameDefs = [
    { x: FP_X - 0.14, s: 0.22 }, { x: FP_X, s: 0.28 }, { x: FP_X + 0.14, s: 0.2 },
  ];
  flameDefs.forEach(function (fd) {
    const mat = makeFlameMaterial();
    const flame = new THREE.Mesh(new THREE.ConeGeometry(fd.s * 0.5, fd.s, 6), mat);
    flame.position.set(fd.x, midY + 0.24 + fd.s / 2, FP_WALL_Z + 0.36);
    house.add(flame);
    flames.push(flame);
    gsap.to(flame.scale, {
      x: 1.14, z: 1.14, y: 1.2,
      duration: 0.32 + Math.random() * 0.16,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 0.4,
    });
    gsap.to(mat.color, {
      r: 1, g: 0.82, b: 0.48,
      duration: 0.4 + Math.random() * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 0.5,
    });
    gsap.to(mat, {
      emissiveIntensity: 1.7,
      duration: 0.35 + Math.random() * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 0.5,
    });
  });

  const fireLight = new THREE.PointLight(0xff8a3d, 1.3, 4.5, 2);
  fireLight.position.set(FP_X, midY + 0.5, FP_WALL_Z + 0.5);
  house.add(fireLight);
  gsap.to(fireLight, { intensity: 1.4, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // brick chimney chase — visible against the back wall in the attic, running down into the mantel
  const chaseTopY = CHIMNEY_CHASE_TOP_Y;
  const chaseBottomY = midY + 1.4;
  const chimneyChase = new THREE.Mesh(new THREE.BoxGeometry(0.42, chaseTopY - chaseBottomY, 0.26), mats.brickMat);
  chimneyChase.position.set(CHIMNEY_X, (chaseTopY + chaseBottomY) / 2, FP_WALL_Z + 0.14);
  chimneyChase.castShadow = true; chimneyChase.receiveShadow = true;
  house.add(chimneyChase);

  // ---------- Fireside carpet ----------
  const CARPET_X = FP_X - 0.05, CARPET_Z = 0.35;
  const carpetBorder = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.15), new THREE.MeshStandardMaterial({ color: 0x2c241f, roughness: 1 }));
  carpetBorder.rotation.x = -Math.PI / 2;
  carpetBorder.position.set(CARPET_X, midY + 0.03, CARPET_Z);
  house.add(carpetBorder);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.95), new THREE.MeshStandardMaterial({ color: 0xa8433a, roughness: 0.95 }));
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(CARPET_X, midY + 0.045, CARPET_Z);
  house.add(carpet);

  // ---------- Two separated purple armchairs facing the fireplace ----------
  const CHAIR_PURPLE = 0x8E44AD;
  // angled in slightly toward the fireplace's centerline (FP_X) rather than
  // sitting dead-parallel, so the pair reads as facing the fire together
  const CHAIR_ANGLE_IN = 0.18;
  makeChair(house, 1.3, 0.75, Math.PI - CHAIR_ANGLE_IN, CHAIR_PURPLE); // left of the hearth, turned right toward it
  makeChair(house, 2.55, 0.75, Math.PI + CHAIR_ANGLE_IN, CHAIR_PURPLE); // right of the hearth, turned left toward it

  // ---------- Window: snowy woods scene painted on the glass, with a frame ----------
  const winTex = makeWindowSceneTexture();
  const winMat = new THREE.MeshStandardMaterial({ map: winTex, emissiveMap: winTex, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.9 });
  box(house, 1.03, 1.23, 0.03, 0xf4f4f2, -2.3, midY + 1.3, -HALF_D + 0.07); // frame
  const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.15), winMat);
  frontWindow.position.set(-2.3, midY + 1.3, -HALF_D + 0.095);
  house.add(frontWindow);
  box(house, 0.035, 1.13, 0.02, 0xf4f4f2, -2.3, midY + 1.3, -HALF_D + 0.115); // mullion V
  box(house, 0.93, 0.035, 0.02, 0xf4f4f2, -2.3, midY + 1.3, -HALF_D + 0.115); // mullion H

  return {
    thermoBezel,
    thermoScreenTex,
    drawThermostat: thermostatDisplay.draw,
    flames,
    fireLight,
  };
}
