import { gsap } from 'gsap';
import { DEFAULT_VIEW } from './constants.js';

/**
 * Owns the orbit camera's target/radius/phi state and animates it with GSAP.
 * theta (heading) is fixed at 0 — the camera only zooms/pans to a room, never
 * orbits around it.
 */
export function createCameraController(camera) {
  const theta = 0;
  const target = { x: DEFAULT_VIEW.x, y: DEFAULT_VIEW.y, z: DEFAULT_VIEW.z };
  let phi = DEFAULT_VIEW.phi;
  let radius = DEFAULT_VIEW.radius;
  const minR = 5.5, maxR = 22;

  const camProxy = { tx: DEFAULT_VIEW.x, ty: DEFAULT_VIEW.y, tz: DEFAULT_VIEW.z, radius: DEFAULT_VIEW.radius, phi: DEFAULT_VIEW.phi };

  function updateCamera() {
    const sinPhi = Math.sin(phi);
    camera.position.x = target.x + radius * sinPhi * Math.sin(theta);
    camera.position.y = target.y + radius * Math.cos(phi);
    camera.position.z = target.z + radius * sinPhi * Math.cos(theta);
    camera.lookAt(target.x, target.y, target.z);
  }

  function flyCameraTo(focus, duration, ease) {
    gsap.killTweensOf(camProxy);
    gsap.to(camProxy, {
      tx: focus.x, ty: focus.y, tz: focus.z,
      radius: focus.radius, phi: focus.phi,
      duration: duration || 1.3,
      ease: ease || 'power2.out',
      onUpdate: function () {
        target.x = camProxy.tx; target.y = camProxy.ty; target.z = camProxy.tz;
        radius = camProxy.radius;
        phi = camProxy.phi;
        updateCamera();
      },
    });
  }

  function setRadius(r) {
    radius = Math.max(minR, Math.min(maxR, r));
    camProxy.radius = radius;
    updateCamera();
  }

  function killFlight() {
    gsap.killTweensOf(camProxy);
  }

  updateCamera();

  return { updateCamera, flyCameraTo, setRadius, killFlight, get radius() { return radius; } };
}
