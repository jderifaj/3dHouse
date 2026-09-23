import * as THREE from 'three';
import {
  HALF_W, HALF_D, WALL_T,
  Y_ATTIC_FLOOR, WALL_TOP_Y,
  BASEMENT_H, LIVING_H, ATTIC_WALL_H,
  BASEMENT_MID_Y, LIVING_MID_Y, ATTIC_MID_Y,
  BASE_Y, Y_MID_FLOOR,
  EAVE_OVERHANG, RISE, HALF_SPAN, RIDGE_Y, SLOPE_LEN, PITCH, ROOF_DEPTH, ROOF_THICK,
  CHIMNEY_X, CHIMNEY_Z, CHIMNEY_HEIGHT, CHIMNEY_CENTER_Y,
} from './constants.js';

/** Builds the house shell (walls, floors, roof, gable, chimney, attic joists). */
export function buildHouse(scene, mats) {
  const house = new THREE.Group();
  scene.add(house);

  function addWallSeg(w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    house.add(m);
    return m;
  }

  addWallSeg(HALF_W * 2 + 0.1, BASEMENT_H, WALL_T, 0, BASEMENT_MID_Y, -HALF_D, mats.cinderMat);
  addWallSeg(HALF_W * 2 + 0.1, LIVING_H, WALL_T, 0, LIVING_MID_Y, -HALF_D, mats.shiplapMat);
  addWallSeg(HALF_W * 2 + 0.1, ATTIC_WALL_H, WALL_T, 0, ATTIC_MID_Y, -HALF_D, mats.wallMat);

  addWallSeg(WALL_T, BASEMENT_H, HALF_D * 2, -HALF_W, BASEMENT_MID_Y, 0, mats.cinderMat);
  addWallSeg(WALL_T, LIVING_H, HALF_D * 2, -HALF_W, LIVING_MID_Y, 0, mats.shiplapMat);
  addWallSeg(WALL_T, ATTIC_WALL_H, HALF_D * 2, -HALF_W, ATTIC_MID_Y, 0, mats.wallMat);

  addWallSeg(WALL_T, BASEMENT_H, HALF_D * 2, HALF_W, BASEMENT_MID_Y, 0, mats.cinderMat);
  addWallSeg(WALL_T, LIVING_H, HALF_D * 2, HALF_W, LIVING_MID_Y, 0, mats.shiplapMat);
  addWallSeg(WALL_T, ATTIC_WALL_H, HALF_D * 2, HALF_W, ATTIC_MID_Y, 0, mats.wallMat);

  addWallSeg(HALF_W * 2 + 0.15, 0.35, HALF_D * 2 + 0.15, 0, BASE_Y - 0.15, 0, mats.stoneMat);

  function addFloor(y, wid) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(wid, 0.12, HALF_D * 2), mats.floorMat);
    f.position.set(0, y, 0);
    f.receiveShadow = true; f.castShadow = true;
    house.add(f);
    return f;
  }
  addFloor(Y_MID_FLOOR, HALF_W * 2 + 0.1);
  addFloor(Y_ATTIC_FLOOR, HALF_W * 2 + 0.1);

  addWallSeg(WALL_T, BASEMENT_H, HALF_D * 2, 0, BASEMENT_MID_Y, 0, mats.cinderMat);

  // ---------- Roof (precise gable geometry, correct orientation) ----------
  function buildRoofPanel(sign) {
    const rot = -sign * PITCH;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(SLOPE_LEN, ROOF_THICK, ROOF_DEPTH), mats.roofMat);
    panel.position.set(sign * HALF_SPAN / 2, WALL_TOP_Y + RISE / 2, 0);
    panel.rotation.z = rot;
    panel.castShadow = true; panel.receiveShadow = true;
    house.add(panel);

    const normal = sign > 0
      ? new THREE.Vector3(Math.sin(PITCH), Math.cos(PITCH), 0)
      : new THREE.Vector3(-Math.sin(PITCH), Math.cos(PITCH), 0);
    const snow = new THREE.Mesh(new THREE.BoxGeometry(SLOPE_LEN * 0.92, 0.05, ROOF_DEPTH * 0.94), mats.snowRoofMat);
    snow.position.set(panel.position.x + normal.x * 0.075, panel.position.y + normal.y * 0.075, 0);
    snow.rotation.z = rot;
    snow.castShadow = true; snow.receiveShadow = true;
    house.add(snow);
    return panel;
  }
  buildRoofPanel(-1);
  buildRoofPanel(1);

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, ROOF_DEPTH), mats.roofMat);
  ridge.position.set(0, RIDGE_Y + 0.06, 0);
  ridge.castShadow = true;
  house.add(ridge);

  // (fascia trim removed — was reading as an unwanted brown frame around the roofline)

  const gableShape = new THREE.Shape();
  gableShape.moveTo(-HALF_W, 0);
  gableShape.lineTo(HALF_W, 0);
  gableShape.lineTo(0, RISE);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  const gable = new THREE.Mesh(gableGeo, mats.wallMat);
  gable.position.set(0, WALL_TOP_Y, -HALF_D - 0.01);
  gable.castShadow = true;
  house.add(gable);

  // stack runs from just below the interior chase's top (see livingRoom.js)
  // up through the roof, so the two pieces read as one continuous chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, CHIMNEY_HEIGHT, 0.4), mats.brickMat);
  chimney.position.set(CHIMNEY_X, CHIMNEY_CENTER_Y, CHIMNEY_Z);
  chimney.castShadow = true;
  house.add(chimney);
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.52), mats.trimMat);
  chimneyCap.position.set(CHIMNEY_X, WALL_TOP_Y + 1.52, CHIMNEY_Z);
  house.add(chimneyCap);

  // ---------- Attic floor joists — same plane as insulation, poking slightly through the top ----------
  const atticY = Y_ATTIC_FLOOR;
  const JOIST_Z_POSITIONS = [-HALF_D + 0.15, -HALF_D + 0.75, 0, HALF_D - 0.6, HALF_D - 0.1];
  JOIST_Z_POSITIONS.forEach(function (zpos) {
    const joist = new THREE.Mesh(new THREE.BoxGeometry(HALF_W * 2 - 0.1, 0.1, 0.1), mats.beamMat);
    joist.position.set(0, atticY + 0.22, zpos);
    joist.castShadow = true; joist.receiveShadow = true;
    house.add(joist);
  });

  return house;
}
