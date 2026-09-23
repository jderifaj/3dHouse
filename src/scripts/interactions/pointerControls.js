function touchDist(a, b) {
  const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Wires mouse wheel zoom, pinch-to-zoom, tap-to-pick and click-to-pick on the
 * renderer's canvas. `cameraController` supplies zoom state; `pick(x, y)`
 * resolves a screen point to a room id (or null); `onPick(roomId)` is called
 * when a room is tapped/clicked.
 */
export function bindPointerControls(dom, cameraController, pick, onPick) {
  dom.addEventListener('wheel', function (e) {
    e.preventDefault();
    cameraController.killFlight();
    cameraController.setRadius(cameraController.radius + e.deltaY * 0.01);
  }, { passive: false });

  let pinchStartDist = null;
  let isPinching = false;
  let touchStartPos = null;

  dom.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isPinching = false;
    } else if (e.touches.length === 2) {
      isPinching = true;
      pinchStartDist = touchDist(e.touches[0], e.touches[1]);
    }
  }, { passive: true });

  dom.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      isPinching = true;
      cameraController.killFlight();
      const d = touchDist(e.touches[0], e.touches[1]);
      const delta = pinchStartDist - d;
      cameraController.setRadius(cameraController.radius + delta * 0.02);
      pinchStartDist = d;
    }
  }, { passive: true });

  dom.addEventListener('touchend', function (e) {
    if (!isPinching && touchStartPos && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - touchStartPos.x;
      const dy = e.changedTouches[0].clientY - touchStartPos.y;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
        const roomId = pick(touchStartPos.x, touchStartPos.y);
        if (roomId) onPick(roomId);
      }
    }
    if (e.touches.length === 0) { isPinching = false; touchStartPos = null; }
  });

  dom.addEventListener('click', function (e) {
    const roomId = pick(e.clientX, e.clientY);
    if (roomId) onPick(roomId);
  });
}
