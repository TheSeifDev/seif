import type {
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";

export type MoonSceneHandle = {
  setProgress(progress: number): void;
  setVisible(visible: boolean): void;
  resize(): void;
  dispose(): void;
};

const FRUSTUM_HALF_SIZE = 1.1;
const MAX_DPR = 1.5;
const SLOW_FRAME_MS = 28;
const SLOW_FRAME_LIMIT = 3;

const craterCenters = [
  [0.72, 0.26, 0.63],
  [-0.34, 0.79, 0.32],
  [-0.76, 0.08, 0.38],
  [0.13, -0.62, 0.77],
  [0.58, -0.68, -0.28],
  [-0.2, 0.18, -0.96],
] as const;

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}

function normalizedCenter(
  center: readonly [number, number, number],
): [number, number, number] {
  const length = Math.hypot(center[0], center[1], center[2]) || 1;
  return [center[0] / length, center[1] / length, center[2] / length];
}

function surfaceVariation(x: number, y: number, z: number): number {
  const centers = craterCenters.map(normalizedCenter);
  let variation =
    Math.sin(x * 17.1 + y * 7.3 - z * 11.9) * 0.0035 +
    Math.sin(x * 31.7 - y * 13.2 + z * 19.4) * 0.002;

  for (let index = 0; index < centers.length; index += 1) {
    const center = centers[index];
    const dot = Math.min(
      1,
      Math.max(-1, x * center[0] + y * center[1] + z * center[2]),
    );
    const angularDistance = Math.acos(dot);
    const radius = 0.075 + (index % 3) * 0.024;
    const normalizedDistance = angularDistance / radius;

    if (normalizedDistance < 1) {
      const bowl = -0.011 * (1 - normalizedDistance * normalizedDistance);
      const rimDistance = (normalizedDistance - 0.76) / 0.2;
      const rim = 0.008 * Math.exp(-(rimDistance * rimDistance));
      variation += bowl + rim;
    }
  }

  return Math.max(-0.025, Math.min(0.025, variation));
}

function deformMoonGeometry(geometry: SphereGeometry): void {
  const position = geometry.getAttribute("position");

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const length = Math.hypot(x, y, z) || 1;
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    const radius = 1 + surfaceVariation(nx, ny, nz);

    position.setXYZ(index, nx * radius, ny * radius, nz * radius);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export async function createMoonScene(
  host: HTMLElement,
  onFailure: () => void,
): Promise<MoonSceneHandle | null> {
  let canvas: HTMLCanvasElement | null = null;
  let renderer: WebGLRenderer | null = null;
  let scene: Scene | null = null;
  let camera: OrthographicCamera | null = null;
  let geometry: SphereGeometry | null = null;
  let material: MeshStandardMaterial | null = null;
  let moon: Mesh | null = null;
  let rafId: number | null = null;
  let contextLostListener: ((event: Event) => void) | null = null;
  let contextListenerAttached = false;
  let disposed = false;
  let failureNotified = false;
  let visible = true;
  let progress = 0;
  let frameCount = 0;
  let slowFrameCount = 0;
  let dprDegraded = false;
  let pixelRatio = 1;
  let width = 0;
  let height = 0;
  let readyForRender = false;

  const notifyFailure = (): void => {
    if (failureNotified) return;
    failureNotified = true;
    try {
      onFailure();
    } catch {
      // Failure callbacks belong to the parent and must not prevent cleanup.
    }
  };

  const cancelQueuedRender = (): void => {
    if (rafId === null) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  };

  const cleanup = (): void => {
    if (disposed) return;
    disposed = true;
    cancelQueuedRender();

    if (canvas && contextLostListener && contextListenerAttached) {
      canvas.removeEventListener("webglcontextlost", contextLostListener);
      contextListenerAttached = false;
    }

    if (scene) scene.clear();
    if (geometry) geometry.dispose();
    if (material) material.dispose();

    if (renderer) {
      try {
        renderer.dispose();
      } catch {
        // Continue releasing the remaining resources if the context is already lost.
      }
      try {
        renderer.forceContextLoss();
      } catch {
        // Context loss is best-effort on browsers without the extension.
      }
    }

    if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);

    canvas = null;
    renderer = null;
    scene = null;
    camera = null;
    geometry = null;
    material = null;
    moon = null;
    contextLostListener = null;
  };

  const resizeNow = (): void => {
    if (disposed || !renderer || !camera || !canvas) return;

    const rect = host.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width || 340));
    const nextHeight = Math.max(1, Math.round(rect.height || 340));
    const devicePixelRatio =
      typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1;
    const nextPixelRatio = dprDegraded
      ? 1
      : Math.min(MAX_DPR, Math.max(1, devicePixelRatio || 1));

    if (
      nextWidth === width &&
      nextHeight === height &&
      nextPixelRatio === pixelRatio
    )
      return;

    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextPixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);

    const aspect = width / height;
    if (aspect >= 1) {
      camera.left = -FRUSTUM_HALF_SIZE * aspect;
      camera.right = FRUSTUM_HALF_SIZE * aspect;
      camera.top = FRUSTUM_HALF_SIZE;
      camera.bottom = -FRUSTUM_HALF_SIZE;
    } else {
      camera.left = -FRUSTUM_HALF_SIZE;
      camera.right = FRUSTUM_HALF_SIZE;
      camera.top = FRUSTUM_HALF_SIZE / aspect;
      camera.bottom = -FRUSTUM_HALF_SIZE / aspect;
    }
    camera.updateProjectionMatrix();
    canvas.dataset.dpr = String(pixelRatio);
  };

  const renderOnce = (): void => {
    rafId = null;
    if (
      disposed ||
      !visible ||
      document.hidden ||
      !renderer ||
      !scene ||
      !camera ||
      !canvas
    )
      return;

    const startedAt = performance.now();
    renderer.render(scene, camera);
    const duration = performance.now() - startedAt;
    frameCount += 1;

    canvas.dataset.frameCount = String(frameCount);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.dpr = String(pixelRatio);
    canvas.dataset.progress = String(progress);
    if (!readyForRender) {
      readyForRender = true;
      canvas.style.visibility = "visible";
    }

    if (duration > SLOW_FRAME_MS) {
      slowFrameCount += 1;
      if (slowFrameCount >= SLOW_FRAME_LIMIT) {
        if (!dprDegraded && pixelRatio > 1) {
          dprDegraded = true;
          slowFrameCount = 0;
          resizeNow();
        } else {
          notifyFailure();
          cleanup();
        }
      }
    } else {
      slowFrameCount = 0;
    }
  };

  const queueRender = (): void => {
    if (disposed || !visible || document.hidden || rafId !== null) return;
    rafId = window.requestAnimationFrame(renderOnce);
  };

  try {
    const probeCanvas = document.createElement("canvas");
    let webgl2: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      webgl2 = probeCanvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      webgl2 = null;
    }

    if (!webgl2) {
      notifyFailure();
      cleanup();
      return null;
    }

    const THREE = await import("three");
    if (disposed) return null;

    canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    canvas.style.visibility = "hidden";
    canvas.dataset.frameCount = "0";
    canvas.dataset.drawCalls = "0";
    canvas.dataset.triangles = "0";
    canvas.dataset.progress = "0";

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
      -FRUSTUM_HALF_SIZE,
      FRUSTUM_HALF_SIZE,
      FRUSTUM_HALF_SIZE,
      -FRUSTUM_HALF_SIZE,
      0.1,
      10,
    );
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    geometry = new THREE.SphereGeometry(1, 48, 24);
    deformMoonGeometry(geometry);
    material = new THREE.MeshStandardMaterial({
      color: 0xd9edf5,
      roughness: 0.94,
      metalness: 0,
      depthTest: true,
      depthWrite: true,
    });
    moon = new THREE.Mesh(geometry, material);
    scene.add(moon);

    const ambient = new THREE.AmbientLight(0x8eaabd, 1.15);
    const keyLight = new THREE.DirectionalLight(0xeaf8ff, 2.15);
    keyLight.position.set(-2.8, 2.4, 4.2);
    const rimLight = new THREE.DirectionalLight(0x4aa6ce, 1.1);
    rimLight.position.set(2.6, -1.4, -2.5);
    scene.add(ambient, keyLight, rimLight);

    contextLostListener = (event: Event): void => {
      event.preventDefault();
      notifyFailure();
      cleanup();
    };
    canvas.addEventListener("webglcontextlost", contextLostListener, {
      passive: false,
    });
    contextListenerAttached = true;

    resizeNow();
    host.appendChild(canvas);

    if (typeof renderer.compileAsync === "function") {
      await renderer.compileAsync(scene, camera);
    }
    if (disposed) return null;

    queueRender();

    return {
      setProgress(nextProgress: number): void {
        if (disposed || !moon || !canvas) return;
        progress = clampProgress(nextProgress);
        moon.rotation.y = progress * 0.55 - 0.275;
        moon.rotation.x = progress * 0.12 - 0.06;
        moon.position.y = (progress - 0.5) * 0.025;
        moon.position.z = Math.abs(progress - 0.5) * -0.012;
        canvas.dataset.progress = String(progress);
        queueRender();
      },

      setVisible(nextVisible: boolean): void {
        if (disposed) return;
        visible = nextVisible;
        if (!visible) {
          cancelQueuedRender();
          return;
        }
        queueRender();
      },

      resize(): void {
        if (disposed) return;
        resizeNow();
        queueRender();
      },

      dispose(): void {
        cleanup();
      },
    } satisfies MoonSceneHandle;
  } catch {
    notifyFailure();
    cleanup();
    return null;
  }
}
