import * as THREE from 'three';
import { ROOMS } from '../../data/rooms.js';
import { ROOM_BOUNDS, HL_OUTLINE, HL_FLOOR, HL_LIGHT, HL_EMISSIVE } from './constants.js';

function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Builds per-room hitboxes (for raycasting), glow outlines/floor patches/lights,
 * and wires "hero" meshes (e.g. the thermostat, the insulation) to glow when
 * their room is active. Returns the hitboxes (for picking) and an update()
 * function to call every frame with the currently active room id.
 */
export function buildRoomHighlights(house, heroMeshesByRoom) {
  const hitboxes = [];
  const highlights = {};

  ROOMS.forEach(function (room) {
    const b = ROOM_BOUNDS[room.id];

    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), hitMat);
    hitbox.position.set(b.x, b.y, b.z);
    hitbox.userData.roomId = room.id;
    house.add(hitbox);
    hitboxes.push(hitbox);

    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w, b.h, b.d));
    const outlineMat = new THREE.LineBasicMaterial({ color: room.color, transparent: true, opacity: 0 });
    const outline = new THREE.LineSegments(edges, outlineMat);
    outline.position.set(b.x, b.y, b.z);
    house.add(outline);

    const glowMat = new THREE.MeshBasicMaterial({ color: room.color, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(b.floorW, b.floorD), glowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(b.x, b.floorY, b.z);
    house.add(floorGlow);

    const roomLight = new THREE.PointLight(room.color, 0, 5.5, 2);
    roomLight.position.set(b.x, b.y + b.h * 0.3, b.z);
    house.add(roomLight);

    const heroMeshes = heroMeshesByRoom[room.id] || [];

    highlights[room.id] = { outline, floorGlow, roomLight, heroMeshes };
  });

  function update(activeRoom) {
    ROOMS.forEach(function (room) {
      const hl = highlights[room.id];
      const isActive = activeRoom === room.id;
      const k = 0.12;

      hl.outline.material.opacity = lerp(hl.outline.material.opacity, isActive ? HL_OUTLINE : 0, k);
      hl.floorGlow.material.opacity = lerp(hl.floorGlow.material.opacity, isActive ? HL_FLOOR : 0, k);
      hl.roomLight.intensity = lerp(hl.roomLight.intensity, isActive ? HL_LIGHT : 0, k);

      hl.heroMeshes.forEach(function (mesh) {
        if (mesh.material && mesh.material.emissive) {
          mesh.material.emissive.setHex(room.color);
          mesh.material.emissiveIntensity = lerp(mesh.material.emissiveIntensity || 0, isActive ? HL_EMISSIVE : 0, k);
        }
      });
    });
  }

  return { hitboxes, update };
}
