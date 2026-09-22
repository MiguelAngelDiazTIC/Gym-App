import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Check, X, Dumbbell } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import { generateId } from '../utils/id'
import type { Profile } from '../types'
import { color, font, radius, springDefault, springSnappy } from '../styles/theme'
import { Input } from '../components/ui/Field'
import { IconButton } from '../components/ui/Button'
import { ConfirmDeleteButton } from '../components/ui/ConfirmDeleteButton'

interface Props {
  onSelect: (profile: Profile) => void
}

export default function ProfileScreen({ onSelect }: Props) {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('profiles', [])
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameError, setNewNameError] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  function createProfile() {
    if (!newName.trim()) {
      setNewNameError('Escribe un nombre')
      return
    }
    const profile: Profile = {
      id: generateId(),
      name: newName.trim(),
    }
    setProfiles(prev => [...prev, profile])
    setNewName('')
    setNewNameError(null)
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
        id: generateId(),
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
      height: '100dvh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      background: color.bg,
      backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,138,61,0.12), transparent 55%)`,
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
          boxShadow: '0 8px 24px -6px rgba(255,138,61,0.5)',
        }}>
          <Dumbbell size={26} color={color.accentContrastText} strokeWidth={2.3} />
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
        <AnimatePresence initial={false}>
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: springDefault }}
            transition={{ ...springDefault, delay: i * 0.04 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

            {editing === profile.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  aria-label="Cambiar foto"
                  onClick={() => editFileRef.current?.click()}
                  style={{
                    width: 84, height: 84, borderRadius: radius.lg,
                    background: color.surface,
                    border: `1px solid ${color.border}`,
                    overflow: 'hidden', cursor: 'pointer', touchAction: 'manipulation',
                    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: color.textTertiary, fontSize: 12, fontFamily: font.ui }}>Foto</span>}
                </button>
                <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handlePhoto(profile.id, e.target.files[0])} />
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(profile.id)}
                  autoFocus
                  style={{ width: 96, textAlign: 'center', padding: '6px 8px' }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <IconButton onClick={() => saveEdit(profile.id)} label="Guardar nombre" style={{ color: color.success }}>
                    <Check size={16} />
                  </IconButton>
                  <IconButton onClick={() => setEditing(null)} label="Cancelar edición" style={{ color: color.accent }}>
                    <X size={16} />
                  </IconButton>
                </div>
              </div>
            ) : (
              <>
                <motion.button
                  type="button"
                  aria-label={`Entrar como ${profile.name}`}
                  onClick={() => onSelect(profile)}
                  whileTap={{ scale: 0.94 }}
                  transition={springSnappy}
                  style={{
                    width: 84, height: 84, borderRadius: radius.lg,
                    background: color.surface,
                    border: `1px solid ${color.border}`,
                    overflow: 'hidden', cursor: 'pointer', touchAction: 'manipulation',
                    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{
                        fontFamily: font.ui,
                        fontSize: 26, fontWeight: 800,
                        color: color.text,
                      }}>{profile.name[0].toUpperCase()}</span>}
                </motion.button>
                <span style={{
                  fontFamily: font.ui,
                  fontSize: 13.5, fontWeight: 600, color: color.textSecondary, letterSpacing: -0.1,
                }}>{profile.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconButton onClick={() => startEdit(profile)} label={`Editar ${profile.name}`} style={{ padding: 4 }}>
                    <Pencil size={13} />
                  </IconButton>
                  <ConfirmDeleteButton
                    onConfirm={() => deleteProfile(profile.id)}
                    label={`el perfil de ${profile.name} y todo su historial`}
                    size={13}
                  />
                </div>
              </>
            )}
          </motion.div>
        ))}
        </AnimatePresence>

        {profiles.length < 5 && !adding && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <motion.button
              type="button"
              aria-label="Añadir perfil"
              onClick={() => setAdding(true)}
              whileTap={{ scale: 0.94 }}
              transition={springSnappy}
              style={{
                width: 84, height: 84, borderRadius: radius.lg,
                background: 'transparent',
                border: `1.5px dashed ${color.border}`,
                cursor: 'pointer', touchAction: 'manipulation',
                userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}>
              <Plus size={24} color={color.textTertiary} />
            </motion.button>
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
            <button
              type="button"
              aria-label="Añadir foto"
              onClick={() => fileRef.current?.click()}
              style={{
                width: 84, height: 84, borderRadius: radius.lg,
                background: color.surface, border: `1.5px dashed ${color.border}`,
                cursor: 'pointer', touchAction: 'manipulation',
                userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}>
              <span style={{ color: color.textTertiary, fontSize: 12, fontFamily: font.ui }}>+ Foto</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleNewPhoto(e.target.files[0])} />
            <Input
              value={newName}
              onChange={e => { setNewName(e.target.value); setNewNameError(null) }}
              onKeyDown={e => e.key === 'Enter' && createProfile()}
              placeholder="Nombre"
              autoFocus
              style={{
                width: 96, textAlign: 'center', padding: '6px 8px',
                boxShadow: newNameError ? `0 0 0 2px ${color.accent}` : undefined,
              }}
            />
            {newNameError && (
              <div style={{ fontFamily: font.ui, fontSize: 11.5, fontWeight: 600, color: color.accent }}>
                {newNameError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <IconButton onClick={createProfile} label="Crear perfil" style={{ color: color.success }}>
                <Check size={16} />
              </IconButton>
              <IconButton onClick={() => { setAdding(false); setNewName(''); setNewNameError(null) }} label="Cancelar" style={{ color: color.accent }}>
                <X size={16} />
              </IconButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
