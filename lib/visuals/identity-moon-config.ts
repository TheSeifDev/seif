/**
 * Geometry shared by the Identity Sequence layout (Tailwind classes in
 * components/home/identity.tsx), its GSAP timeline (components/motion/scenes.ts)
 * and the Three.js moon (lib/visuals/identity-moon-scene.ts).
 *
 * Keep the literal Tailwind values in identity.tsx in sync with these numbers:
 * moon host `left-[53%] top-[17.5%] w-[170%]`, fallback disc `size-[43%]`.
 */
export const IDENTITY_MOON = {
  /** Moon host square size relative to the portrait width. */
  hostScale: 1.7,
  /** Horizontal head centre in the portrait cut-out (0–1). */
  headX: 0.53,
  /** Vertical head centre in the portrait cut-out (0–1). */
  headY: 0.175,
  /** Final moon diameter as a share of the host square. */
  screenFraction: 0.43,
  /** Vertical field of view of the moon camera, in degrees. */
  fov: 30,
} as const;

/** Scroll-driven moon state, published by the master timeline. */
export type MoonState = {
  /** 0 → 1 while the moon rises behind the portrait. */
  rise: number;
  /** 0 → 1 while the sequence exits towards The Journey. */
  exit: number;
};

/** DOM event dispatched on the identity scene root on every timeline update. */
export const MOON_EVENT = "identity:moon";
