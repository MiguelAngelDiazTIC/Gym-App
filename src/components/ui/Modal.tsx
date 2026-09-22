import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { color, radius, shadow, springDefault } from '../../styles/theme'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, onClose, children }: Props) {
  return (
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
            animate={{ y: 0 }}
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
    </AnimatePresence>
  )
}
