import type { InputHTMLAttributes } from 'react'
import { color, font, radius } from '../../styles/theme'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: font.ui,
      fontSize: 13,
      fontWeight: 600,
      color: color.textSecondary,
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
        background: color.surface,
        color: color.text,
        padding: '11px 14px',
        borderRadius: radius.md,
        fontSize: 16, // 16px minimum — smaller triggers iOS Safari's zoom-on-focus
        fontFamily: font.ui,
        fontWeight: 500,
        border: 'none',
        outline: 'none',
        letterSpacing: -0.1,
        boxShadow: '0 0 0 0px transparent',
        transition: 'box-shadow 150ms',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${color.accentSoft}`; props.onFocus?.(e) }}
      onBlur={e => { e.currentTarget.style.boxShadow = '0 0 0 0px transparent'; props.onBlur?.(e) }}
    />
  )
}
