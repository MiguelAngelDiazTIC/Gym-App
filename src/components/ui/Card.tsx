import { motion } from 'motion/react'
import type { ReactNode, CSSProperties } from 'react'
import { color, font, radius, shadow, springDefault } from '../../styles/theme'

interface Props {
  children: ReactNode
  style?: CSSProperties
  onClick?: () => void
  active?: boolean
}

export function Card({ children, style, onClick, active }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springDefault}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      style={{
        background: color.surface,
        border: `1px solid ${active ? color.borderStrong : color.border}`,
        borderRadius: radius.lg,
        boxShadow: shadow.card,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}>
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      fontFamily: font.ui,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: color.textTertiary,
      ...style,
    }}>{children}</div>
  )
}

export function ScreenTitle({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: font.ui,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: -0.5,
        lineHeight: 1.1,
        color: color.text,
      }}>{children}</div>
      {subtitle && (
        <div style={{
          fontFamily: font.ui,
          fontSize: 14,
          color: color.textSecondary,
          marginTop: 4,
          letterSpacing: -0.1,
        }}>{subtitle}</div>
      )}
    </div>
  )
}
