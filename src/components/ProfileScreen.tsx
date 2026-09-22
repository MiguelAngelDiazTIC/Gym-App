import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { Plus, Pencil, Trash2, Check, X, Dumbbell } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import type { Profile } from '../types'
import { color, font, radius, springDefault, springSnappy } from '../styles/theme'
import { Input } from '../components/ui/Field'
import { IconButton } from '../components/ui/Button'

interface Props {
  onSelect: (profile: Profile) => void
}

export default function ProfileScreen({ onSelect }: Props) {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('profiles', [])
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editName, setEditName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  function createProfile() {
    if (!newName.trim()) return
    const profile: Profile = {
      id: crypto.randomUUID(),
      name: newName.trim(),
    }
    setProfiles(prev => [...prev, profile])
    setNewName('')
    setAdding(false)
  }

  function deleteProfile(id: string) {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  function startEdit(profile: Profile) {
    setEditing(profile.id)
    setEditName(profile.name)
  }

  function saveEdit(id: string) {
    if (!editName.trim()) return
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, name: editName.trim() } : p)
    )
    setEditing(null)
  }

  function handlePhoto(id: string, file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setProfiles(prev =>
        prev.map(p => p.id === id ? { ...p, photo: base64 } : p)
      )
    }
    reader.readAsDataURL(file)
  }

  function handleNewPhoto(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      const profile: Profile = {
        id: crypto.randomUUID(),
        name: newName.trim() || 'Perfil',
        photo: base64,
      }
      setProfiles(prev => [...prev, profile])
      setNewName('')
      setAdding(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: color.bg,
      backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,45,85,0.12), transparent 55%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springDefault}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: 52, height: 52, borderRadius: radius.lg,
          background: color.accentGradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.1rem',
          boxShadow: '0 8px 24px -6px rgba(255,45,85,0.5)',
        }}>
          <Dumbbell size={26} color="#fff" strokeWidth={2.3} />
        </div>
        <h1 style={{
          fontFamily: font.ui,
          fontSize: 26,
          fontWeight: 800,
          color: color.text,
          letterSpacing: -0.6,
          textAlign: 'center',
        }}>¿Quién entrena hoy?</h1>
      </motion.div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        justifyContent: 'center',
        maxWidth: 420,
        marginBottom: '2rem',
      }}>
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springDefault, delay: i * 0.04 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

            {editing === profile.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => editFileRef.current?.click()}
                  style={{
                    width: 84, height: 84, borderRadius: radius.lg,
                    background: color.surface,
                    border: `1px solid ${color.border}`,
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: color.textTertiary, fontSize: 12, fontFamily: font.ui }}>Foto</span>}
                </div>
                <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handlePhoto(profile.id, e.target.files[0])} />
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(profile.id)}
                  autoFocus
                  style={{ width: 84, textAlign: 'center', padding: '6px 8px', fontSize: 13 }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <IconButton onClick={() => saveEdit(profile.id)} style={{ color: color.success }}>
                    <Check size={16} />
                  </IconButton>
                  <IconButton onClick={() => setEditing(null)} style={{ color: color.accent }}>
                    <X size={16} />
                  </IconButton>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  onClick={() => onSelect(profile)}
                  whileTap={{ scale: 0.94 }}
                  transition={springSnappy}
                  style={{
                    width: 84, height: 84, borderRadius: radius.lg,
                    background: color.surface,
                    border: `1px solid ${color.border}`,
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{
                        fontFamily: font.ui,
                        fontSize: 26, fontWeight: 800,
                        color: color.text,
                      }}>{profile.name[0].toUpperCase()}</span>}
                </motion.div>
                <span style={{
                  fontFamily: font.ui,
                  fontSize: 13.5, fontWeight: 600, color: color.textSecondary, letterSpacing: -0.1,
                }}>{profile.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconButton onClick={() => startEdit(profile)} style={{ padding: 4 }}>
                    <Pencil size={13} />
                  </IconButton>
                  <IconButton onClick={() => deleteProfile(profile.id)} style={{ padding: 4 }}>
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              </>
            )}
          </motion.div>
        ))}

        {profiles.length < 5 && !adding && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <motion.div
              onClick={() => setAdding(true)}
              whileTap={{ scale: 0.94 }}
              transition={springSnappy}
              style={{
                width: 84, height: 84, borderRadius: radius.lg,
                background: 'transparent',
                border: `1.5px dashed ${color.border}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Plus size={24} color={color.textTertiary} />
            </motion.div>
            <span style={{
              fontFamily: font.ui,
              fontSize: 13.5, fontWeight: 500, color: color.textTertiary,
            }}>Añadir</span>
          </div>
        )}

        {adding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springDefault}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 84, height: 84, borderRadius: radius.lg,
                background: color.surface, border: `1.5px dashed ${color.border}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <span style={{ color: color.textTertiary, fontSize: 12, fontFamily: font.ui }}>+ Foto</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleNewPhoto(e.target.files[0])} />
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createProfile()}
              placeholder="Nombre"
              autoFocus
              style={{ width: 84, textAlign: 'center', padding: '6px 8px', fontSize: 13 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <IconButton onClick={createProfile} style={{ color: color.success }}>
                <Check size={16} />
              </IconButton>
              <IconButton onClick={() => { setAdding(false); setNewName('') }} style={{ color: color.accent }}>
                <X size={16} />
              </IconButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
