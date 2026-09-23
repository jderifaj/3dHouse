import * as THREE from 'three';

/** Creates a function that raycasts a client (x, y) point against `hitboxes` and returns the hit room id, or null. */
export function createPicker(dom, camera, hitboxes) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  return function pick(clientX, clientY) {
    const rect = dom.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitboxes);
    return intersects.length > 0 ? intersects[0].object.userData.roomId : null;
  };
}
