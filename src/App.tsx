import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Weight, Dumbbell, UtensilsCrossed, LogOut } from 'lucide-react'
import ProfileScreen from './components/ProfileScreen'
import WeightTab from './components/WeightTab'
import RoutineTab from './components/RoutineTab'
import NutritionTab from './components/NutritionTab'
import { color, font, radius, springDefault, springSnappy } from './styles/theme'
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
      minHeight: '100dvh',
      background: color.bg,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* Header — translucent material, floats above content */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(0.9rem + env(safe-area-inset-top)) 1.25rem 0.9rem',
        background: 'rgba(8,8,12,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${color.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeProfile.photo
            ? <img src={activeProfile.photo} style={{
                width: 34, height: 34, borderRadius: radius.pill,
                objectFit: 'cover', border: `1px solid ${color.borderStrong}`,
              }} />
            : <div style={{
                width: 34, height: 34, borderRadius: radius.pill,
                background: color.accentGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font.ui,
                fontWeight: 700, fontSize: 15, color: '#fff',
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
          style={{ color: color.textTertiary, fontSize: 12, fontWeight: 600, gap: 5, padding: '6px 8px' }}>
          <LogOut size={15} />
        </IconButton>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}>
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

      {/* Bottom tab bar — translucent material, floating indicator */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: 'rgba(12,12,17,0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid ${color.border}`,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.92 }}
              transition={springSnappy}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px 0 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                position: 'relative',
              }}>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  transition={springDefault}
                  style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                    borderRadius: 2,
                    background: color.accentGradient,
                  }}
                />
              )}
              <tab.icon
                size={21}
                strokeWidth={active ? 2.4 : 2}
                color={active ? color.text : color.textTertiary}
              />
              <span style={{
                fontFamily: font.ui,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: -0.1,
                color: active ? color.text : color.textTertiary,
              }}>{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
