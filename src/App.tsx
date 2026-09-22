import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Weight, Dumbbell, UtensilsCrossed, LogOut } from 'lucide-react'
import ProfileScreen from './components/ProfileScreen'
import WeightTab from './components/WeightTab'
import RoutineTab from './components/RoutineTab'
import NutritionTab from './components/NutritionTab'
import { color, font, radius, shadow, springDefault, springSnappy } from './styles/theme'
import { IconButton } from './components/ui/Button'

type Tab = 'weight' | 'routine' | 'nutrition'

import type { Profile } from './types'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'weight', label: 'Peso', icon: Weight },
  { id: 'routine', label: 'Rutina', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrición', icon: UtensilsCrossed },
]

export default function App() {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('weight')

  if (!activeProfile) {
    return <ProfileScreen onSelect={setActiveProfile} />
  }

  return (
    <div style={{
      height: '100dvh',
      overflow: 'hidden',
      background: color.bg,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* Header — no bar chrome (no background/blur/border): the avatar, name,
          and logout control just sit directly on the page background. */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(0.9rem + env(safe-area-inset-top)) 1.25rem 0.9rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeProfile.photo
            ? <img src={activeProfile.photo} style={{
                width: 36, height: 36, borderRadius: radius.pill,
                objectFit: 'cover', border: `1px solid ${color.borderStrong}`,
              }} />
            : <div style={{
                width: 36, height: 36, borderRadius: radius.pill,
                background: color.accentGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font.ui,
                fontWeight: 700, fontSize: 15, color: color.accentContrastText,
              }}>{activeProfile.name[0].toUpperCase()}</div>
          }
          <span style={{
            fontFamily: font.ui,
            fontSize: 16, fontWeight: 700,
            letterSpacing: -0.2, color: color.text,
          }}>{activeProfile.name}</span>
        </div>

        <IconButton
          onClick={() => setActiveProfile(null)}
          label="Cambiar de perfil">
          <LogOut size={17} />
        </IconButton>
      </div>

      {/* Content — the only scrollable region; single scroll container avoids iOS chrome jump.
          Must clear the Fab (the taller of the two floating elements), not just
          the tab bar: Fab bottom-offset 102px + its own ~50px height (28px
          vertical padding + ~22px icon/label row) = ~152px top edge, +20px
          margin = 172px. An earlier pass derived this only from the tab bar's
          height (82px) and never accounted for the Fab's own footprint, which
          let the Fab's top edge overlap the last scrolled-to card. */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingBottom: 'calc(172px + env(safe-area-inset-bottom))',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={springDefault}>
            {activeTab === 'weight' && <WeightTab profileId={activeProfile.id} />}
            {activeTab === 'routine' && <RoutineTab profileId={activeProfile.id} />}
            {activeTab === 'nutrition' && <NutritionTab profileId={activeProfile.id} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar — a floating capsule with margin on every side, icon-only
          (labels removed for a cleaner look; aria-label keeps them named for
          screen readers). Same glass-surface material as every card
          (color.surface), just thinner, plus blur for legibility over
          scrolling content. Icon slot is 44px — the app's own minimum
          touch-target size (see ConfirmDeleteButton/IconButton). Box height:
          12 (pad-top) + 44 (icon slot) + 12 (pad-bottom) = 68px, floating
          14px above the true bottom edge — content padding and the Fab clear
          that ~82px footprint with margin. */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        // No fixed width — the capsule sizes to its content plus side padding.
        maxWidth: 'calc(min(100vw, 480px) - 40px)',
        background: color.surface,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${color.border}`,
        borderRadius: radius.pill,
        boxShadow: shadow.floating,
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 18px',
        gap: 24,
        zIndex: 100,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              whileTap={{ scale: 0.92 }}
              transition={springSnappy}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {active ? (
                <motion.div
                  layoutId="tab-pill"
                  transition={springDefault}
                  style={{
                    width: 44, height: 44, borderRadius: radius.pill,
                    background: color.accent,
                    boxShadow: '0 8px 20px -6px rgba(255,138,61,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <tab.icon size={21} strokeWidth={2.4} color={color.accentContrastText} />
                </motion.div>
              ) : (
                // textSecondary, not textTertiary — icon-only controls have no
                // text fallback for contrast (same rule IconButton follows).
                <tab.icon size={20} strokeWidth={2} color={color.textSecondary} />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
