import type { InputHTMLAttributes } from 'react'
import { color, font, radius } from '../../styles/theme'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: font.ui,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: color.textTertiary,
      marginBottom: 6,
    }}>{children}</div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props
  return (
    <input
      {...rest}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${color.border}`,
        color: color.text,
        padding: '11px 14px',
        borderRadius: radius.md,
        fontSize: 16, // 16px minimum — smaller triggers iOS Safari's zoom-on-focus
        fontFamily: font.ui,
        fontWeight: 500,
        outline: 'none',
        letterSpacing: -0.1,
        transition: 'border-color 150ms',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = color.borderStrong; props.onFocus?.(e) }}
      onBlur={e => { e.currentTarget.style.borderColor = color.border; props.onBlur?.(e) }}
    />
  )
}
