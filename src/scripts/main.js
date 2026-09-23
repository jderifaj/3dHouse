import * as THREE from 'three';
import { createScene, createCamera, createRenderer, addLights, addGround, createSnow, bindResize } from './three/sceneSetup.js';
import { createMaterials } from './three/materials.js';
import { addTrees } from './three/trees.js';
import { buildHouse } from './three/house.js';
import { buildLivingRoom } from './roomContents/livingRoom.js';
import { buildAttic } from './roomContents/attic.js';
import { buildBasement } from './roomContents/basement.js';
import { buildCeilingFan } from './roomContents/ceilingFan.js';
import { createChimneySmoke } from './three/smoke.js';
import { createAirflowLoop } from './three/airflowLoop.js';
import { buildRoomHighlights } from './three/roomHighlights.js';
import { createCameraController } from './three/cameraController.js';
import { createPicker } from './interactions/raycastPicker.js';
import { bindPointerControls } from './interactions/pointerControls.js';
import { createDemos } from './interactions/demos.js';
import { createGlassOverlay } from './interactions/glassOverlay.js';

function init() {
  const wrap = document.getElementById('canvas-wrap');

  const scene = createScene();
  const camera = createCamera();
  const renderer = createRenderer(wrap);
  addLights(scene);
  addGround(scene);
  addTrees(scene);
  const snow = createSnow(scene);
  bindResize(camera, renderer);

  const mats = createMaterials();
  const house = buildHouse(scene, mats);

  const living = buildLivingRoom(house, mats);
  const attic = buildAttic(house);
  const basement = buildBasement(house);
  const fanRotor = buildCeilingFan(house, 0, -0.1, 0.35);
  const smoke = createChimneySmoke(house);
  const airflow = createAirflowLoop(house);

  const heroMeshesByRoom = {
    attic: [attic.insulation],
    living: [living.thermoBezel],
    furnace: [basement.furnaceBody],
    water: [basement.waterTank, basement.waterTankBase],
  };
  const roomHighlights = buildRoomHighlights(house, heroMeshesByRoom);

  const cameraController = createCameraController(camera);

  // Shared read/write handle for "which room is open" — demos need to read it,
  // the glass overlay owns writing it, avoiding a circular module dependency.
  const activeRoomRef = { value: null };

  const fanSpeedProxy = { v: 1.1 };

  const demos = createDemos({
    airflow,
    cameraController,
    drawThermostat: living.drawThermostat,
    thermoScreenTex: living.thermoScreenTex,
    fanSpeedProxy,
    getActiveRoom: function () { return activeRoomRef.value; },
  });

  const glassOverlay = createGlassOverlay({
    cameraController,
    insulation: attic.insulation,
    waterDial: { draw: basement.dialDraw, screenTex: basement.dialScreenTex },
    demos,
    activeRoomRef,
  });

  const pick = createPicker(renderer.domElement, camera, roomHighlights.hitboxes);
  bindPointerControls(renderer.domElement, cameraController, pick, glassOverlay.selectRoom);

  // ---------- Animate ----------
  const clock = new THREE.Clock();
  function animate() {
    const dt = clock.getDelta();

    snow.update(dt);
    smoke.update(dt);
    airflow.update(dt, clock.getElapsedTime());

    if (fanRotor) fanRotor.rotation.y += fanSpeedProxy.v * dt;
    roomHighlights.update(activeRoomRef.value);

    renderer.render(scene, camera);
  }

  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(function () { loadingEl.remove(); }, 400);
  }

  renderer.setAnimationLoop(animate);
}

init();
