// House footprint
export const HALF_W = 3.0;
export const HALF_D = 1.5;
export const WALL_T = 0.08;

// Vertical layout
export const TOTAL_H = 6.6;
export const BASE_Y = -3.3;
export const Y_BASEMENT_FLOOR = BASE_Y;
export const Y_MID_FLOOR = BASE_Y + 2.2;
export const Y_ATTIC_FLOOR = BASE_Y + 4.6;

// Attic knee walls brought down 65% (35% of their original height remains)
export const ATTIC_WALL_H_ORIGINAL = (BASE_Y + TOTAL_H) - Y_ATTIC_FLOOR;
export const ATTIC_WALL_H = ATTIC_WALL_H_ORIGINAL * 0.35;
export const WALL_TOP_Y = Y_ATTIC_FLOOR + ATTIC_WALL_H;

export const BASEMENT_H = Y_MID_FLOOR - Y_BASEMENT_FLOOR;
export const LIVING_H = Y_ATTIC_FLOOR - Y_MID_FLOOR;
export const BASEMENT_MID_Y = (Y_BASEMENT_FLOOR + Y_MID_FLOOR) / 2;
export const LIVING_MID_Y = (Y_MID_FLOOR + Y_ATTIC_FLOOR) / 2;
export const ATTIC_MID_Y = (Y_ATTIC_FLOOR + WALL_TOP_Y) / 2;

// Floor y-levels used by room content builders
export const basY = Y_BASEMENT_FLOOR;
export const midY = Y_MID_FLOOR + 0.06; // true top surface of the living-room floor slab
export const atticY = Y_ATTIC_FLOOR;

// Roof
export const EAVE_OVERHANG = 0.35;
export const DEPTH_OVERHANG = 0.35;
export const RISE = 1.5;
export const HALF_SPAN = HALF_W + EAVE_OVERHANG;
export const RIDGE_Y = WALL_TOP_Y + RISE;
export const SLOPE_LEN = Math.sqrt(HALF_SPAN * HALF_SPAN + RISE * RISE);
export const PITCH = Math.atan2(RISE, HALF_SPAN);
export const ROOF_DEPTH = HALF_D * 2 + DEPTH_OVERHANG * 2;
export const ROOF_THICK = 0.1;

// Chimney — the exterior stack (on the roof) and the interior chase (brick
// column running down to the mantel, see roomContents/livingRoom.js) must
// share one continuous vertical run with no gap between them.
export const CHIMNEY_X = 1.9;
export const CHIMNEY_Z = -HALF_D + 0.14;
export const CHIMNEY_CHASE_TOP_Y = WALL_TOP_Y + 0.05; // top of the interior brick chase
export const CHIMNEY_BASE_Y = CHIMNEY_CHASE_TOP_Y - 0.05; // exterior stack overlaps the chase
export const CHIMNEY_STACK_TOP_Y = WALL_TOP_Y + 1.5; // top of the stack, below the cap
export const CHIMNEY_HEIGHT = CHIMNEY_STACK_TOP_Y - CHIMNEY_BASE_Y;
export const CHIMNEY_CENTER_Y = (CHIMNEY_BASE_Y + CHIMNEY_STACK_TOP_Y) / 2;
export const CHIMNEY_TOP_Y = WALL_TOP_Y + 1.6;

// Fireplace
export const FP_X = 1.9;
export const FP_WALL_Z = -HALF_D;

// Attic insulation
export const INSUL_WIDTH = HALF_W * 2 - 0.06;

// ---------- Room hitbox bounds (for raycasting + highlight outlines) ----------
export const ROOM_BOUNDS = {
  attic: { w: HALF_W * 2 - 0.2, h: 1.9, d: HALF_D * 2 - 0.2, x: 0, y: atticY + 0.9, z: 0, floorY: atticY + 0.1, floorW: HALF_W * 2 - 0.3, floorD: HALF_D * 2 - 0.3 },
  living: { w: HALF_W * 2 - 0.2, h: 2.1, d: HALF_D * 2 - 0.2, x: 0, y: midY + 1.1, z: 0, floorY: midY + 0.07, floorW: HALF_W * 2 - 0.3, floorD: HALF_D * 2 - 0.3 },
  furnace: { w: HALF_W - 0.15, h: 2.2, d: HALF_D * 2 - 0.2, x: 1.5, y: basY + 1.1, z: 0, floorY: basY + 0.07, floorW: HALF_W - 0.3, floorD: HALF_D * 2 - 0.3 },
  water: { w: HALF_W - 0.15, h: 2.2, d: HALF_D * 2 - 0.2, x: -1.5, y: basY + 1.1, z: 0, floorY: basY + 0.07, floorW: HALF_W - 0.3, floorD: HALF_D * 2 - 0.3 },
};

// ---------- Camera framing ----------
export const DEFAULT_VIEW = { x: 0, y: 0.35, z: 0, radius: 14.5, phi: 1.47 };
export const ROOM_FOCUS = {
  attic: { x: 0, y: atticY + 0.85, z: 0.1, radius: 8.5, phi: 1.32 },
  living: { x: 0, y: midY + 0.9, z: 0.25, radius: 8.5, phi: 1.42 },
  furnace: { x: 1.5, y: basY + 1.0, z: 0, radius: 6.5, phi: 1.38 },
  water: { x: -1.5, y: basY + 1.0, z: 0, radius: 6.5, phi: 1.38 },
};
export const THERMO_FOCUS = { x: -1.1, y: midY + 1.55, z: 0.15, radius: 4, phi: 1.5 };
// Fan demo: aim at the fan and tilt the view upward to look up at it (phi > PI/2
// puts the camera below the target) without changing distance or panning — the
// radius is filled in from the camera's current distance when the demo starts.
export const FAN_FOCUS = { x: 0, y: atticY - 0.35, z: -0.1, phi: 2.05 };

// Thermostat demo
export const THERMO_START = 76;
export const THERMO_END = 68;
export const THERMO_DURATION = 3.5;
export const THERMO_ZOOM_DELAY = 0.9;

// Insulation roll-out demo
export const ROLL_DURATION = 5.6;

// Highlight target opacities/intensities
export const HL_OUTLINE = 0;
export const HL_FLOOR = 0.3;
export const HL_LIGHT = 1.6;
export const HL_EMISSIVE = 0.65;
