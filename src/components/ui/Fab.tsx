import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { color, font, springSnappy } from '../../styles/theme'

interface Props {
  onClick: () => void
  label: string
  icon: ReactNode
}

// Portals to <body> for the same reason Modal does: a position:fixed element
// nested inside App.tsx's animated tab-switch wrapper gets trapped in that
// wrapper's transformed box instead of the viewport once Framer Motion applies
// its transform, so it would drift instead of staying pinned above the tab bar.
export function Fab({ onClick, label, icon }: Props) {
  return createPortal(
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      whileTap={{ scale: 0.93 }}
      transition={springSnappy}
      style={{
        position: 'fixed',
        // The floating bar's top edge sits ~82px above the true bottom edge
        // (see App.tsx); this offset clears it with real margin. Content's own
        // paddingBottom is derived from THIS element's height + this offset
        // (see App.tsx) — a prior pass derived content padding only from the
        // tab bar's height and never this button's own footprint, which let
        // the Fab overlap the last scrolled-to card.
        bottom: 'calc(102px + env(safe-area-inset-bottom))',
        // Mirrors the shell's own centering (max-width: 480px, margin: 0 auto)
        // so the FAB sits at the shell's right edge on desktop, not the viewport's.
        right: 'max(20px, calc((100vw - 480px) / 2 + 20px))',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: color.accentGradient,
        border: 'none',
        borderRadius: 999,
        padding: '14px 20px 14px 16px',
        color: color.accentContrastText,
        fontFamily: font.ui,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: -0.1,
        boxShadow: '0 8px 24px -6px rgba(255,138,61,0.55)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}>
      {icon}
      {label}
    </motion.button>,
    document.body
  )
}
