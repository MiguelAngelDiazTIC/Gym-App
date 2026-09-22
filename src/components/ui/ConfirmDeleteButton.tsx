import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Trash2 } from 'lucide-react'
import { color, radius, springSnappy } from '../../styles/theme'

interface Props {
  onConfirm: () => void
  label: string
  size?: number
}

const hitBox: CSSProperties = {
  minWidth: 44,
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  borderRadius: radius.pill,
}

// Every destructive delete in the app routes through this: one tap arms it
// (swaps the bare trash icon for an explicit Cancel/Confirm pair, auto-disarms
// after 4s), a second, spatially distinct tap actually deletes. No delete in
// this app should ever fire from a single accidental tap.
export function ConfirmDeleteButton({ onConfirm, label, size = 13 }: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {armed ? (
        <motion.div
          key="confirm"
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={springSnappy}
          style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.button
            type="button"
            aria-label={`Cancelar eliminar ${label}`}
            onClick={e => { e.stopPropagation(); setArmed(false) }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            style={{ ...hitBox, background: 'none', color: color.textSecondary }}>
            <X size={size} />
          </motion.button>
          <motion.button
            type="button"
            aria-label={`Confirmar eliminar ${label}`}
            onClick={e => { e.stopPropagation(); onConfirm(); setArmed(false) }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            style={{ ...hitBox, background: color.accent, color: color.accentContrastText }}>
            <Trash2 size={size} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          key="trigger"
          type="button"
          aria-label={`Eliminar ${label}`}
          layout
          onClick={e => { e.stopPropagation(); setArmed(true) }}
          whileTap={{ scale: 0.85 }}
          transition={springSnappy}
          style={{ ...hitBox, background: 'none', color: color.textSecondary }}>
          <Trash2 size={size} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
