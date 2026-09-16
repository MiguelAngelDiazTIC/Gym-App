import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import type { Profile } from '../types'

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
      minHeight: '100vh',
      background: '#080b14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 28,
        fontWeight: 700,
        color: '#cdd0de',
        marginBottom: '3rem',
        letterSpacing: 2,
      }}>¿Quién entrena hoy?</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
        maxWidth: 420,
        marginBottom: '2rem',
      }}>
        {profiles.map(profile => (
          <div key={profile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

            {editing === profile.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => editFileRef.current?.click()}
                  style={{
                    width: 80, height: 80, borderRadius: 6,
                    background: '#111520',
                    border: '1px solid #242840',
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#3a4058', fontSize: 11 }}>Foto</span>}
                </div>
                <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handlePhoto(profile.id, e.target.files[0])} />
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(profile.id)}
                  autoFocus
                  style={{
                    background: '#111520', border: '1px solid #242840',
                    color: '#cdd0de', padding: '4px 8px', borderRadius: 3,
                    fontSize: 13, width: 80, textAlign: 'center', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => saveEdit(profile.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c896' }}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditing(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff3d4d' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  onClick={() => onSelect(profile)}
                  style={{
                    width: 80, height: 80, borderRadius: 6,
                    background: '#111520',
                    border: '2px solid transparent',
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#cdd0de'
                    ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  }}>
                  {profile.photo
                    ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 24, fontWeight: 700,
                        color: '#cdd0de',
                      }}>{profile.name[0].toUpperCase()}</span>}
                </div>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, color: '#7a8098', letterSpacing: 0.5,
                }}>{profile.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(profile)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a4058' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteProfile(profile.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a4058' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {profiles.length < 5 && !adding && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              onClick={() => setAdding(true)}
              style={{
                width: 80, height: 80, borderRadius: 6,
                background: '#111520',
                border: '1px dashed #242840',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#7a8098'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#242840'}>
              <Plus size={24} color="#3a4058" />
            </div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, color: '#3a4058',
            }}>Añadir</span>
          </div>
        )}

        {adding && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 6,
                background: '#111520', border: '1px dashed #242840',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <span style={{ color: '#3a4058', fontSize: 11 }}>+ Foto</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleNewPhoto(e.target.files[0])} />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createProfile()}
              placeholder="Nombre"
              autoFocus
              style={{
                background: '#111520', border: '1px solid #242840',
                color: '#cdd0de', padding: '4px 8px', borderRadius: 3,
                fontSize: 13, width: 80, textAlign: 'center', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={createProfile}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c896' }}>
                <Check size={16} />
              </button>
              <button onClick={() => { setAdding(false); setNewName('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff3d4d' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}