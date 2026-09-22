import type { ReactNode } from 'react'

interface Props {
  open: boolean
  children: ReactNode
}

// GPU-friendlier accordion body. Framer Motion's height:'auto' animation has to
// measure with JS every time; grid-template-rows tweens with a native CSS
// transition instead, and still tracks content that resizes while open (adding
// a set, opening the "add item" form) since 1fr always matches content height.
export function Disclosure({ open, children }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      opacity: open ? 1 : 0,
      transition: 'grid-template-rows 350ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out',
    }}>
      <div style={{ overflow: 'hidden', minHeight: 0, pointerEvents: open ? 'auto' : 'none' }} aria-hidden={!open}>
        {children}
      </div>
    </div>
  )
}
