export const color = {
  bg: '#08080c',
  surface: 'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.09)',
  surfaceElevated: '#18181f',
  // Kept for the few non-card affordances that still want a hairline (dashed
  // "add" tile, list dividers) — cards themselves no longer use these.
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  text: '#f5f5f7',
  textSecondary: '#98989f',
  textTertiary: '#57575f',

  // Minimalist-pass accent: warm orange, narrow/subtle gradient range rather
  // than the old coral-to-red spread — reads closer to a flat fill.
  accent: '#ff8a3d',
  accentSoft: 'rgba(255,138,61,0.14)',
  accentGradient: 'linear-gradient(135deg, #ffa563 0%, #ff8a3d 100%)',
  // White text/icons on `accent` compute to ~2.3:1 — this orange is too light
  // to carry white reliably. Use this near-black (same value ChipButton's
  // active state already uses) for anything drawn ON TOP of an accent fill;
  // `accent` itself stays correct as text/icon/stroke on the dark background.
  accentContrastText: '#0a0a0d',

  success: '#32d74b',
  warning: '#ffd60a',
  // No longer tied to `accent` — with accent now the same warm orange as the
  // day's kcal ring, protein needs its own hue to stay legible in that card.
  // Kept close to the old accent (coral-rose) as a deliberate callback.
  protein: '#ff4d6a',
  carbs: '#ffd60a',
  fat: '#64d2ff',

  scrim: 'rgba(4,4,8,0.72)',
} as const

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const

export const font = {
  ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

// Flatter, softer than the original — no inset top highlight, less spread —
// per the minimalist-pass direction (soft ambient shadow, not a "frosted
// edge" effect). Depth still carries a real offset + blur, never zero-blur.
export const shadow = {
  card: '0 8px 24px -12px rgba(0,0,0,0.4)',
  floating: '0 16px 40px -14px rgba(0,0,0,0.5)',
} as const

// Critically damped spring — the app-wide default (no overshoot)
export const springDefault = { type: 'spring', bounce: 0, duration: 0.35 } as const

// Slight bounce, reserved for momentum-driven / celebratory moments
export const springMomentum = { type: 'spring', bounce: 0.25, duration: 0.45 } as const

export const springSnappy = { type: 'spring', bounce: 0, duration: 0.22 } as const
