import { motion } from 'motion/react'
import type { TargetAndTransition } from 'motion/react'
import type { ReactNode, CSSProperties } from 'react'
import { color, font, radius, shadow, springDefault } from '../../styles/theme'

interface Props {
  children: ReactNode
  style?: CSSProperties
  onClick?: () => void
  active?: boolean
  // Only meaningful inside an AnimatePresence — lets a Card animate out when
  // removed from a list (e.g. deleting a row), instead of vanishing instantly.
  exit?: TargetAndTransition
  layout?: boolean
}

export function Card({ children, style, onClick, active, exit, layout }: Props) {
  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={exit}
      transition={springDefault}
      onClick={onClick}
      // role="button" rather than a real <button>: some Cards wrap their own
      // nested interactive controls (e.g. a ConfirmDeleteButton), and a real
      // <button> can't legally contain another one. Enter/Space keep it operable.
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }) : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      style={{
        background: color.surface,
        // xl (was lg) — more generous, pillowy rounding per the minimalist-pass direction.
        borderRadius: radius.xl,
        boxShadow: active ? `0 0 0 1.5px ${color.accent}55, ${shadow.card}` : shadow.card,
        cursor: onClick ? 'pointer' : undefined,
        ...(onClick && {
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }),
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
      fontSize: 13.5,
      fontWeight: 600,
      color: color.textSecondary,
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
