import { useState } from 'react'
import { Weight, Dumbbell, UtensilsCrossed, LogOut } from 'lucide-react'
import ProfileScreen from './components/ProfileScreen'
import WeightTab from './components/WeightTab'
import RoutineTab from './components/RoutineTab'
import NutritionTab from './components/NutritionTab'

type Tab = 'weight' | 'routine' | 'nutrition'

import type { Profile } from './types'

export default function App() {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('weight')

  if (!activeProfile) {
    return <ProfileScreen onSelect={setActiveProfile} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b14',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem 0.75rem',
        borderBottom: '1px solid #1c2030',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeProfile.photo
            ? <img src={activeProfile.photo} style={{
                width: 32, height: 32, borderRadius: 4,
                objectFit: 'cover', border: '1px solid #242840',
              }} />
            : <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: '#111520', border: '1px solid #242840',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 16, color: '#cdd0de',
              }}>{activeProfile.name[0].toUpperCase()}</div>
          }
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14, fontWeight: 700,
            letterSpacing: 1, color: '#cdd0de',
          }}>{activeProfile.name}</span>
        </div>

        <button
          onClick={() => setActiveProfile(null)}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: '#3a4058',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, letterSpacing: 1,
          }}>
          <LogOut size={14} />
          Salir
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {activeTab === 'weight' && <WeightTab profileId={activeProfile.id} />}
        {activeTab === 'routine' && <RoutineTab profileId={activeProfile.id} />}
        {activeTab === 'nutrition' && <NutritionTab profileId={activeProfile.id} />}
      </div>

      {/* Bottom tabs */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#0c0f1c',
        borderTop: '1px solid #1c2030',
        display: 'flex',
        zIndex: 100,
      }}>
        {([
          { id: 'weight', label: 'Peso', icon: Weight },
          { id: 'routine', label: 'Rutina', icon: Dumbbell },
          { id: 'nutrition', label: 'Nutrición', icon: UtensilsCrossed },
        ] as { id: Tab; label: string; icon: any }[]).map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.75rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                borderTop: `2px solid ${active ? '#ff3d4d' : 'transparent'}`,
                transition: 'border-color 0.2s',
              }}>
              <tab.icon
                size={20}
                color={active ? '#ff3d4d' : '#3a4058'}
              />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: active ? '#cdd0de' : '#3a4058',
              }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}