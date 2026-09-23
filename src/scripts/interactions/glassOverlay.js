import { ROOMS } from '../../data/rooms.js';
import { ROOM_FOCUS, DEFAULT_VIEW } from '../three/constants.js';
import { playInsulationRollOut } from '../roomContents/attic.js';
import { playWaterDialSweep } from '../roomContents/basement.js';

/**
 * Owns the "which room is selected" state, the glass info-panel DOM, and the
 * legend buttons' active state. Coordinates the camera, the attic reveal
 * animation and the thermostat/fan demos in response to selection. The panel
 * itself sits in a fixed spot (upper right, see RoomGlass.astro) rather than
 * tracking the room in 3D — simpler and doesn't depend on the camera framing.
 */
export function createGlassOverlay({ cameraController, insulation, waterDial, demos, activeRoomRef }) {
  const glassEl = document.getElementById('room-glass');
  const glassSpecial = document.getElementById('glass-special');

  function selectRoom(id) {
    const room = ROOMS.find(function (r) { return r.id === id; });
    if (!room) return;
    activeRoomRef.value = id;

    document.getElementById('glass-eyebrow').textContent = room.eyebrow;
    document.getElementById('glass-title').textContent = room.title;
    document.getElementById('glass-body').textContent = room.body;
    document.getElementById('glass-stat').textContent = room.stat;
    glassSpecial.style.display = (id === 'living') ? 'flex' : 'none';
    glassEl.classList.add('visible');

    document.querySelectorAll('.room-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.id === id);
    });

    cameraController.flyCameraTo(ROOM_FOCUS[id], 1.3, 'power2.out');

    if (id === 'attic') {
      playInsulationRollOut(insulation);
    }

    if (id === 'water') {
      playWaterDialSweep(waterDial.draw, waterDial.screenTex);
    }

    demos.resetThermoDisplay();
  }

  function closeGlass() {
    activeRoomRef.value = null;
    glassEl.classList.remove('visible');
    document.querySelectorAll('.room-btn').forEach(function (b) { b.classList.remove('active'); });

    cameraController.flyCameraTo(DEFAULT_VIEW, 1.6, 'power2.inOut');
    demos.resetThermoDisplay();
    demos.fadeOutAirflowParticles();
  }

  function stepRoom(delta) {
    const activeRoom = activeRoomRef.value;
    if (!activeRoom) return;
    let idx = 0;
    for (let i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === activeRoom) idx = i;
    const nextIdx = (idx + delta + ROOMS.length) % ROOMS.length;
    selectRoom(ROOMS[nextIdx].id);
  }

  document.getElementById('glass-close').addEventListener('click', closeGlass);
  document.getElementById('glass-prev').addEventListener('click', function () { stepRoom(-1); });
  document.getElementById('glass-next').addEventListener('click', function () { stepRoom(1); });
  document.getElementById('btn-thermo').addEventListener('click', demos.startThermoSequence);
  document.getElementById('btn-fan').addEventListener('click', demos.startFanAirflowDemo);

  document.querySelectorAll('.room-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { selectRoom(btn.dataset.id); });
  });

  return { selectRoom, closeGlass, stepRoom };
}
