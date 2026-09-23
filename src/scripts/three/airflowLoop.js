import * as THREE from 'three';
import { gsap } from 'gsap';
import { HALF_W, HALF_D, midY, atticY } from './constants.js';

const PARTICLE_COUNT = 240;
const COOL_COLOR = new THREE.Color(0x8fc7ea);
const WARM_COLOR = new THREE.Color(0xffab5e);

// Soft, glowing points (screen-space sized, radial falloff) rather than solid
// spheres — reads as drifting air rather than discrete objects.
const VERTEX_SHADER = `
  attribute vec3 particleColor;
  attribute float size;
  attribute float alpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = particleColor;
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (140.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

function ease(u) { return u * u * (3 - 2 * u); }

/**
 * A continuous, looping point-cloud tracing reversed-fan convection: each
 * particle rises near the fan hub, spreads out across the ceiling, flows
 * down a wall, then drifts back along the floor toward the center — colored
 * cool near the floor and warm near the ceiling, the same loop the whole
 * time it runs. start()/stop() fade it in and out without resetting the
 * loop, so re-starting picks up mid-flow rather than snapping back.
 */
export function createAirflowLoop(house) {
  const floorY = midY + 0.1;
  const ceilY = atticY - 0.35;
  const wallReachX = HALF_W - 0.3;
  const wallReachZ = HALF_D - 0.3;
  const baseZ = -0.1;

  const S1 = 0.22, S2 = 0.32, S3 = 0.74;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  const state = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // angle from the back wall (0) through the side walls (±PI/2) — kept away
    // from the open front (±PI) since there's no wall there to flow down
    const ang = (Math.random() * 2 - 1) * 2.35;
    state.push({
      t: Math.random(),
      speed: 0.065 + Math.random() * 0.04,
      wallX: Math.sin(ang) * wallReachX,
      wallZ: baseZ - Math.cos(ang) * wallReachZ,
      jitterX: (Math.random() - 0.5) * 0.7,
      jitterZ: baseZ + (Math.random() - 0.5) * 0.55,
      wobble: Math.random() * Math.PI * 2,
      size: 1.3 + Math.random() * 1.3,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.visible = false;
  house.add(points);

  const fade = { v: 0 };
  let running = false;
  const tmpColor = new THREE.Color();

  function pathFor(p) {
    const t = p.t;
    if (t < S1) {
      const u = ease(t / S1);
      return [p.jitterX * (1 - u * 0.3), floorY + (ceilY - floorY) * u, p.jitterZ * (1 - u * 0.3)];
    }
    if (t < S2) {
      const u = ease((t - S1) / (S2 - S1));
      return [p.jitterX + (p.wallX - p.jitterX) * u, ceilY, p.jitterZ + (p.wallZ - p.jitterZ) * u];
    }
    if (t < S3) {
      const u = ease((t - S2) / (S3 - S2));
      return [p.wallX, ceilY - (ceilY - floorY) * u, p.wallZ];
    }
    const u = ease((t - S3) / (1 - S3));
    return [p.wallX + (p.jitterX - p.wallX) * u, floorY, p.wallZ + (p.jitterZ - p.wallZ) * u];
  }

  function update(dt, elapsed) {
    if (!running && fade.v <= 0.001) {
      if (points.visible) points.visible = false;
      return;
    }
    points.visible = true;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = state[i];
      p.t += dt * p.speed;
      if (p.t > 1) p.t -= 1;

      const [x, y, z] = pathFor(p);
      const wob = Math.sin(elapsed * 0.8 + p.wobble) * 0.03;

      positions[i * 3] = x + wob;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z + Math.cos(elapsed * 0.6 + p.wobble) * 0.03;

      const heightFrac = Math.max(0, Math.min(1, (y - floorY) / (ceilY - floorY)));
      tmpColor.copy(COOL_COLOR).lerp(WARM_COLOR, heightFrac);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;

      const fadeIn = Math.min(1, p.t / 0.08);
      const fadeOut = Math.min(1, (1 - p.t) / 0.08);
      alphas[i] = 0.4 * Math.min(fadeIn, fadeOut) * fade.v;
      sizes[i] = p.size;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.particleColor.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  }

  function start() {
    running = true;
    gsap.killTweensOf(fade);
    gsap.to(fade, { v: 1, duration: 0.6, ease: 'sine.out' });
  }

  function stop() {
    running = false;
    gsap.killTweensOf(fade);
    gsap.to(fade, { v: 0, duration: 0.6, ease: 'sine.in' });
  }

  return { update, start, stop };
}
