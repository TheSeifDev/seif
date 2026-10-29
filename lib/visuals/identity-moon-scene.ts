import type {
  BufferGeometry,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  WebGLRenderer,
} from "three";
import { IDENTITY_MOON, type MoonState } from "./identity-moon-config";

/**
 * Identity Sequence moon. Loaded with a dynamic import only in the pinned
 * desktop mode, rendered on demand (state changes, resizes, visibility), and
 * fully disposed when the mode or route changes. It owns no animation clock
 * and no ScrollTrigger: the master GSAP timeline publishes `MoonState`.
 */

export type IdentityMoonHandle = {
  setState(state: MoonState): void;
  setVisible(visible: boolean): void;
  resize(): void;
  dispose(): void;
};

type Callbacks = {
  /** First frame has been drawn. */
  onReady(): void;
  /** WebGL unavailable, context lost, or rendering too slow. */
  onFailure(): void;
};

const MAX_DPR = 1.5;
const SLOW_FRAME_MS = 32;
const SLOW_FRAME_LIMIT = 3;

const HALF_FOV = (IDENTITY_MOON.fov * Math.PI) / 360;
/** Camera distance at which the moon spans `screenFraction` of the host. */
const END_DISTANCE = 1 / (IDENTITY_MOON.screenFraction * Math.tan(HALF_FOV));
const START_DISTANCE = END_DISTANCE + 2.4;
const EXIT_DISTANCE = 3.2;
/** Moon centre below the head when the rise begins (world units). */
const RISE_OFFSET = -1.55;
const EXIT_DRIFT = 0.7;

const clamp01 = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Deterministic PRNG so the surface is identical on every visit. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Equirectangular albedo: soft maria, craters and fine grain in cool greys. */
function paintSurface(): HTMLCanvasElement {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const rand = seeded(7);

  ctx.fillStyle = "#d8e3ec";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 9; i += 1) {
    const x = rand() * width;
    const y = height * (0.25 + rand() * 0.5);
    const rx = 60 + rand() * 140;
    const squash = 0.5 + rand() * 0.4;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);
    gradient.addColorStop(0, "rgba(78, 98, 122, 0.42)");
    gradient.addColorStop(0.7, "rgba(92, 112, 136, 0.2)");
    gradient.addColorStop(1, "rgba(92, 112, 136, 0)");
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, squash);
    ctx.translate(-x, -y);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 220; i += 1) {
    const x = rand() * width;
    const y = height * (0.08 + rand() * 0.84);
    const r = 2 + Math.pow(rand(), 3) * 22;
    const gradient = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
    gradient.addColorStop(0, "rgba(60, 78, 98, 0.3)");
    gradient.addColorStop(0.75, "rgba(70, 88, 108, 0.12)");
    gradient.addColorStop(0.9, "rgba(240, 248, 255, 0.18)");
    gradient.addColorStop(1, "rgba(240, 248, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rand() - 0.5) * 14;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Soft Light Blue halo sprite behind the moon. */
function paintHalo(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const c = size / 2;
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
  gradient.addColorStop(0, "rgba(140, 205, 255, 0.55)");
  gradient.addColorStop(0.32, "rgba(77, 182, 255, 0.22)");
  gradient.addColorStop(0.62, "rgba(77, 182, 255, 0.06)");
  gradient.addColorStop(1, "rgba(77, 182, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

const craterCenters = [
  [0.72, 0.26, 0.63],
  [-0.34, 0.79, 0.32],
  [-0.76, 0.08, 0.38],
  [0.13, -0.62, 0.77],
  [0.58, -0.68, -0.28],
  [-0.2, 0.18, -0.96],
  [0.36, 0.42, 0.83],
  [-0.52, -0.31, 0.79],
].map(([x, y, z]) => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length] as const;
});

/** Subtle relief so the terminator reads as a surface, not a flat disc. */
function deform(geometry: SphereGeometry) {
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const length = Math.hypot(x, y, z) || 1;
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    let variation =
      Math.sin(nx * 17.1 + ny * 7.3 - nz * 11.9) * 0.0035 +
      Math.sin(nx * 31.7 - ny * 13.2 + nz * 19.4) * 0.002;
    craterCenters.forEach((center, index) => {
      const dot = Math.min(1, Math.max(-1, nx * center[0] + ny * center[1] + nz * center[2]));
      const distance = Math.acos(dot) / (0.075 + (index % 3) * 0.024);
      if (distance < 1) {
        const rim = (distance - 0.76) / 0.2;
        variation += -0.011 * (1 - distance * distance) + 0.008 * Math.exp(-(rim * rim));
      }
    });
    const radius = 1 + Math.max(-0.025, Math.min(0.025, variation));
    position.setXYZ(i, nx * radius, ny * radius, nz * radius);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  void main() {
    float rim = pow(max(0.0, 0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(uColor * rim * uOpacity, rim * uOpacity);
  }
`;

export async function createIdentityMoon(
  host: HTMLElement,
  callbacks: Callbacks,
): Promise<IdentityMoonHandle | null> {
  let disposed = false;
  let failureNotified = false;
  let ready = false;
  let visible = true;
  let frame: number | null = null;
  let frames = 0;
  let slowFrames = 0;
  let degraded = false;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let state: MoonState = { rise: 0, exit: 0 };

  let canvas: HTMLCanvasElement | null = null;
  let renderer: WebGLRenderer | null = null;
  let scene: Scene | null = null;
  let camera: PerspectiveCamera | null = null;
  let group: Group | null = null;
  let moon: Mesh | null = null;
  let key: DirectionalLight | null = null;
  let atmosphere: ShaderMaterial | null = null;
  let halo: MeshBasicMaterial | null = null;
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];

  const onContextLost = (event: Event) => {
    event.preventDefault();
    fail();
  };

  const cancelFrame = () => {
    if (frame === null) return;
    window.cancelAnimationFrame(frame);
    frame = null;
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelFrame();
    canvas?.removeEventListener("webglcontextlost", onContextLost);
    scene?.clear();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    if (renderer) {
      try {
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {
        // The context may already be gone; keep releasing the rest.
      }
    }
    canvas?.remove();
    canvas = null;
    renderer = null;
    scene = null;
    camera = null;
    group = null;
    moon = null;
    key = null;
    atmosphere = null;
    halo = null;
  };

  function fail() {
    if (!failureNotified) {
      failureNotified = true;
      try {
        callbacks.onFailure();
      } catch {
        // The parent's callback must never prevent cleanup.
      }
    }
    cleanup();
  }

  const apply = () => {
    if (!group || !moon || !camera || !key || !atmosphere || !halo) return;
    const rise = smooth(clamp01(state.rise));
    const exit = smooth(clamp01(state.exit));
    group.position.y = lerp(RISE_OFFSET, 0, rise) + EXIT_DRIFT * exit;
    camera.position.z = lerp(START_DISTANCE, END_DISTANCE, rise) + EXIT_DISTANCE * exit;
    moon.rotation.y = -0.65 + 0.8 * rise + 0.35 * exit;
    moon.rotation.x = 0.16 - 0.1 * rise;
    key.intensity = (0.35 + 2.6 * rise) * (1 - 0.7 * exit);
    atmosphere.uniforms.uOpacity.value = rise * (1 - 0.8 * exit);
    halo.opacity = 0.6 * rise * (1 - exit);
  };

  const resizeNow = () => {
    if (disposed || !renderer || !camera || !canvas) return;
    const rect = host.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextRatio = degraded ? 1 : Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
    if (nextWidth === width && nextHeight === height && nextRatio === pixelRatio) return;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    canvas.dataset.dpr = String(pixelRatio);
  };

  const render = () => {
    frame = null;
    if (disposed || !visible || document.hidden || !renderer || !scene || !camera || !canvas) return;
    const startedAt = performance.now();
    renderer.render(scene, camera);
    const duration = performance.now() - startedAt;
    frames += 1;
    canvas.dataset.frames = String(frames);
    canvas.dataset.rise = state.rise.toFixed(3);
    canvas.dataset.exit = state.exit.toFixed(3);
    if (!ready) {
      ready = true;
      callbacks.onReady();
    }
    if (duration > SLOW_FRAME_MS) {
      slowFrames += 1;
      if (slowFrames >= SLOW_FRAME_LIMIT) {
        if (!degraded && pixelRatio > 1) {
          degraded = true;
          slowFrames = 0;
          resizeNow();
        } else {
          fail();
        }
      }
    } else {
      slowFrames = 0;
    }
  };

  const queue = () => {
    if (disposed || !visible || document.hidden || frame !== null) return;
    frame = window.requestAnimationFrame(render);
  };

  try {
    const THREE = await import("three");
    if (disposed) return null;

    canvas = document.createElement("canvas");
    canvas.dataset.frames = "0";
    canvas.addEventListener("webglcontextlost", onContextLost, { passive: false });

    // Throws when WebGL is unavailable; handled by the catch below.
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(IDENTITY_MOON.fov, 1, 0.1, 50);
    camera.position.set(0, 0, START_DISTANCE);
    camera.lookAt(0, 0, 0);

    const surface = new THREE.CanvasTexture(paintSurface());
    surface.colorSpace = THREE.SRGBColorSpace;
    surface.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const haloTexture = new THREE.CanvasTexture(paintHalo());
    haloTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(surface, haloTexture);

    const sphere = new THREE.SphereGeometry(1, 128, 96);
    deform(sphere);
    const shell = new THREE.SphereGeometry(1.14, 64, 48);
    const plane = new THREE.PlaneGeometry(4.4, 4.4);
    geometries.push(sphere, shell, plane);

    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8f2fa,
      map: surface,
      roughness: 0.96,
      metalness: 0,
    });
    atmosphere = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x4db6ff) },
        uOpacity: { value: 0 },
      },
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    halo = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materials.push(surfaceMaterial, atmosphere, halo);

    group = new THREE.Group();
    moon = new THREE.Mesh(sphere, surfaceMaterial);
    moon.rotation.z = 0.08;
    const glow = new THREE.Mesh(shell, atmosphere);
    const haloMesh = new THREE.Mesh(plane, halo);
    haloMesh.position.z = -1.4;
    group.add(haloMesh, glow, moon);
    scene.add(group);

    const ambient = new THREE.AmbientLight(0x26496b, 0.35);
    key = new THREE.DirectionalLight(0xeef7ff, 0.35);
    key.position.set(-3, 2, 4);
    const rim = new THREE.DirectionalLight(0x4db6ff, 1.6);
    rim.position.set(4, 0.5, -1);
    scene.add(ambient, key, rim);

    apply();
    resizeNow();
    host.appendChild(canvas);
    if (typeof renderer.compileAsync === "function") {
      await renderer.compileAsync(scene, camera);
    }
    if (disposed) return null;
    queue();

    return {
      setState(next) {
        if (disposed) return;
        state = { rise: clamp01(next.rise), exit: clamp01(next.exit) };
        apply();
        queue();
      },
      setVisible(next) {
        if (disposed) return;
        visible = next;
        if (visible) queue();
        else cancelFrame();
      },
      resize() {
        if (disposed) return;
        resizeNow();
        queue();
      },
      dispose: cleanup,
    };
  } catch {
    fail();
    return null;
  }
}
