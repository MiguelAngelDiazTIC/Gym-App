export const color = {
  bg: '#08080c',
  surface: 'rgba(255,255,255,0.045)',
  surfaceHover: 'rgba(255,255,255,0.07)',
  surfaceElevated: '#16161d',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  text: '#f5f5f7',
  textSecondary: '#98989f',
  textTertiary: '#57575f',

  accent: '#ff3b5c',
  accentSoft: 'rgba(255,59,92,0.14)',
  accentGradient: 'linear-gradient(135deg, #ff6b4a 0%, #ff2d55 100%)',

  success: '#32d74b',
  warning: '#ffd60a',
  protein: '#ff3b5c',
  carbs: '#ffd60a',
  fat: '#64d2ff',

  scrim: 'rgba(4,4,8,0.72)',
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const

export const font = {
  ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

export const shadow = {
  card: '0 1px 1px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.5)',
  floating: '0 4px 12px rgba(0,0,0,0.3), 0 16px 40px -12px rgba(0,0,0,0.6)',
} as const

// Critically damped spring — the app-wide default (no overshoot)
export const springDefault = { type: 'spring', bounce: 0, duration: 0.35 } as const

// Slight bounce, reserved for momentum-driven / celebratory moments
export const springMomentum = { type: 'spring', bounce: 0.25, duration: 0.45 } as const

export const springSnappy = { type: 'spring', bounce: 0, duration: 0.22 } as const
