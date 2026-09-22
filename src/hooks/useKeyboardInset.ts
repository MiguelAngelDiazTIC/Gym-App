import { useEffect, useState } from 'react'

// iOS Safari keeps the layout viewport full-height when the keyboard opens —
// a `position: fixed` bottom sheet ends up partly hidden behind it. This tracks
// how many px of the layout viewport's bottom the keyboard currently covers,
// so a sheet can shift up by exactly that much (and back to 0 once it closes).
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop
      setInset(Math.max(0, Math.round(covered)))
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
