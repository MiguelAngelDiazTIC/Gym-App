import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { color, radius, shadow, springDefault } from '../../styles/theme'
import { useKeyboardInset } from '../../hooks/useKeyboardInset'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, onClose, children }: Props) {
  const keyboardInset = useKeyboardInset()

  // Portal to <body>: a fixed-position sheet nested inside an animated (transformed)
  // ancestor gets trapped in that ancestor's box instead of the viewport, so on mobile
  // it ends up clipped instead of overlaying the bottom tab bar.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: color.scrim,
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 300, padding: 0,
          }}>
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: -keyboardInset }}
            exit={{ y: '100%' }}
            transition={springDefault}
            style={{
              background: color.surfaceElevated,
              border: `1px solid ${color.border}`,
              borderBottom: 'none',
              borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
              boxShadow: shadow.floating,
              padding: '1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))',
              width: '100%',
              maxWidth: 480,
              maxHeight: keyboardInset > 0 ? `calc(100dvh - ${keyboardInset}px - 24px)` : '85dvh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}>
            <div style={{
              width: 36, height: 5, borderRadius: 3,
              background: color.borderStrong,
              margin: '0 auto 1.25rem',
            }} />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
