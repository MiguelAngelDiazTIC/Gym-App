import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { color, radius, shadow, springDefault } from '../../styles/theme'
import { useKeyboardInset } from '../../hooks/useKeyboardInset'

interface Props {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
}

export function Modal({ open, onClose, label, children }: Props) {
  const keyboardInset = useKeyboardInset()
  const sheetRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Moves focus into the sheet on open (an autoFocus field inside children
  // claims it first when there is one) and restores it to whatever triggered
  // the modal on close, instead of leaving focus lost on a removed element.
  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => {
      if (sheetRef.current && !sheetRef.current.contains(document.activeElement)) {
        sheetRef.current.focus()
      }
    }, 0)
    return () => {
      clearTimeout(t)
      previouslyFocused.current?.focus?.()
    }
  }, [open])

  // Escape closes; Tab is trapped inside the sheet so background content
  // (still present behind the scrim) never receives keyboard focus.
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !sheetRef.current) return
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

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
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            initial={{ transform: 'translateY(100%)' }}
            animate={{ transform: `translateY(${-keyboardInset}px)` }}
            exit={{ transform: 'translateY(100%)' }}
            transition={springDefault}
            style={{
              background: color.surfaceElevated,
              borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
              boxShadow: shadow.floating,
              padding: '1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))',
              width: '100%',
              maxWidth: 480,
              maxHeight: keyboardInset > 0 ? `calc(100dvh - ${keyboardInset}px - 24px)` : '85dvh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              outline: 'none',
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
