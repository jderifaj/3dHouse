import { gsap } from 'gsap';
import {
  THERMO_START, THERMO_END, THERMO_DURATION, THERMO_ZOOM_DELAY,
  THERMO_FOCUS, FAN_FOCUS, ROOM_FOCUS,
} from '../three/constants.js';

/**
 * The two "play" demos inside the living-room glass panel: winding the
 * thermostat down, and reversing the ceiling fan to show recirculated warm air.
 */
export function createDemos({ airflow, cameraController, drawThermostat, thermoScreenTex, fanSpeedProxy, getActiveRoom }) {
  let thermoLastDrawn = THERMO_START;
  let thermoTween = null;

  function resetThermoDisplay() {
    if (thermoTween) { thermoTween.kill(); thermoTween = null; }
    if (thermoLastDrawn !== THERMO_START) {
      drawThermostat(THERMO_START);
      thermoScreenTex.needsUpdate = true;
      thermoLastDrawn = THERMO_START;
    }
  }

  function startThermoSequence() {
    cameraController.flyCameraTo(THERMO_FOCUS, 1.3, 'power2.out');
    const thermoObj = { value: THERMO_START };
    if (thermoTween) thermoTween.kill();
    thermoTween = gsap.timeline({ delay: THERMO_ZOOM_DELAY });
    thermoTween.to(thermoObj, {
      value: THERMO_END,
      duration: THERMO_DURATION,
      ease: 'power1.inOut',
      onUpdate: function () {
        const val = Math.round(thermoObj.value);
        if (val !== thermoLastDrawn) {
          drawThermostat(val);
          thermoScreenTex.needsUpdate = true;
          thermoLastDrawn = val;
        }
      },
      onComplete: function () {
        if (getActiveRoom() !== 'living') return;
        // back up a bit once the thermostat has reached 68°
        cameraController.flyCameraTo(ROOM_FOCUS.living, 2.4, 'power2.inOut');
      },
    });
  }

  // ---------- Fan airflow demo: reversed, the fan pulls cool air up from the
  // room while the warm air pooled at the ceiling gets pushed out and back
  // down along the walls. The particle loop itself lives in airflowLoop.js —
  // this just starts/stops it and handles the camera + fan direction. ----------
  function startFanAirflowDemo() {
    airflow.start();
    // Tilt to look up at the fan without zooming or panning — keep whatever
    // distance the camera is already at.
    cameraController.flyCameraTo(
      { x: FAN_FOCUS.x, y: FAN_FOCUS.y, z: FAN_FOCUS.z, radius: cameraController.radius, phi: FAN_FOCUS.phi },
      1.3,
      'power2.out'
    );
    gsap.killTweensOf(fanSpeedProxy);
    gsap.to(fanSpeedProxy, { v: -Math.abs(fanSpeedProxy.v || 1.1), duration: 1.4, ease: 'power2.inOut' });

    gsap.delayedCall(4.5, function () {
      if (getActiveRoom() === 'living') cameraController.flyCameraTo(ROOM_FOCUS.living, 1.8, 'power2.inOut');
    });
  }

  function fadeOutAirflowParticles() {
    airflow.stop();
  }

  return { startThermoSequence, startFanAirflowDemo, resetThermoDisplay, fadeOutAirflowParticles };
}
