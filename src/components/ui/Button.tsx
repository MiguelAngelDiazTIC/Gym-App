import { motion } from 'motion/react'
import type { ReactNode, CSSProperties } from 'react'
import { color, font, radius, springSnappy } from '../../styles/theme'

interface BaseProps {
  onClick?: (e: React.MouseEvent) => void
  children: ReactNode
  style?: CSSProperties
  disabled?: boolean
  type?: 'button' | 'submit'
}

const base: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: font.ui,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  // No outline:none here — index.css's :focus-visible rule supplies the
  // branded focus ring; suppressing it per-component would silently break
  // keyboard navigation on every button in the app.
  WebkitTapHighlightColor: 'transparent',
}

export function PrimaryButton({ onClick, children, style, disabled, type = 'button' }: BaseProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      style={{
        ...base,
        background: color.accentGradient,
        color: color.accentContrastText,
        borderRadius: radius.pill,
        padding: '11px 20px',
        fontSize: 14.5,
        letterSpacing: -0.1,
        opacity: disabled ? 0.5 : 1,
        boxShadow: '0 4px 14px -4px rgba(255,138,61,0.5)',
        ...style,
      }}>
      {children}
    </motion.button>
  )
}

export function SecondaryButton({ onClick, children, style, disabled, type = 'button' }: BaseProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      style={{
        ...base,
        background: color.surface,
        color: color.textSecondary,
        borderRadius: radius.pill,
        padding: '10px 18px',
        fontSize: 14.5,
        letterSpacing: -0.1,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}>
      {children}
    </motion.button>
  )
}

export function IconButton({ onClick, children, style, disabled, label }: BaseProps & { label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.85 }}
      transition={springSnappy}
      style={{
        ...base,
        background: 'none',
        // textSecondary (~7:1 on the app background) rather than textTertiary
        // (~2.8:1) — icon-only controls have no text fallback for contrast.
        color: color.textSecondary,
        padding: 6,
        borderRadius: radius.sm,
        ...style,
      }}>
      {children}
    </motion.button>
  )
}

export function ChipButton({ onClick, children, active, style }: BaseProps & { active?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={springSnappy}
      style={{
        ...base,
        background: active ? color.text : color.surface,
        color: active ? '#0a0a0d' : color.textSecondary,
        borderRadius: radius.pill,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: -0.1,
        ...style,
      }}>
      {children}
    </motion.button>
  )
}
