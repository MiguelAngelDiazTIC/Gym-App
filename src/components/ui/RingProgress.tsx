import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { color, springDefault } from '../../styles/theme'

interface Props {
  value: number // 0–1, clamped
  size?: number
  strokeWidth?: number
  trackColor?: string
  fillColor?: string
  children?: ReactNode
}

// Minimalist-pass primitive: a circular progress ring, replacing a linear
// bar for the single headline stat on a card (e.g. daily kcal). Author's own
// SVG rather than pulling Recharts in for one ring.
export function RingProgress({ value, size = 96, strokeWidth = 10, trackColor, fillColor, children }: Props) {
  const clamped = Math.min(Math.max(value, 0), 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={trackColor ?? color.border} strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={fillColor ?? color.accent} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={springDefault}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  )
}
