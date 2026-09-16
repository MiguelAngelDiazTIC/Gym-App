import { useState } from 'react'
import { Plus, X, Check, Pencil, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import type { Routine, WorkoutDay, Exercise, WorkoutLog, ExerciseLog } from '../types'

interface Props {
  profileId: string
}

type View = 'home' | 'createRoutine' | 'editDay' | 'workout' | 'logs'

export default function RoutineTab({ profileId }: Props) {
  const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', [])
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>('workoutLogs', [])

  const [view, setView] = useState<View>('home')
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  // Create routine
  const [routineName, setRoutineName] = useState('')
  const [numDays, setNumDays] = useState(3)

  // Edit day
  const [editingDayName, setEditingDayName] = useState('')
  const [newExercise, setNewExercise] = useState('')

  // Workout session
  const [sessionLog, setSessionLog] = useState<ExerciseLog[]>([])
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [newSet, setNewSet] = useState({ reps: '', weight: '' })

  const myRoutines = routines.filter(r => r.profileId === profileId)
  const myLogs = logs.filter(l => l.profileId === profileId)

  // ─── Create routine ───────────────────────────────────────

  function createRoutine() {
    if (!routineName.trim()) return
    const days: WorkoutDay[] = Array.from({ length: numDays }, (_, i) => ({
      id: crypto.randomUUID(),
      name: `Día ${i + 1}`,
      exercises: [],
    }))
    const routine: Routine = {
      id: crypto.randomUUID(),
      profileId,
      name: routineName.trim(),
      days,
    }
    setRoutines(prev => [...prev, routine])
    setSelectedRoutine(routine)
    setRoutineName('')
    setView('home')
  }

  function deleteLog(logId: string) {
    setLogs(prev => prev.filter(l => l.id !== logId))
  }

  function deleteRoutine(id: string) {
    setRoutines(prev => prev.filter(r => r.id !== id))
    if (selectedRoutine?.id === id) setSelectedRoutine(null)
  }

  // ─── Edit day ─────────────────────────────────────────────

  function openEditDay(routine: Routine, day: WorkoutDay) {
    setSelectedRoutine(routine)
    setSelectedDay(day)
    setEditingDayName(day.name)
    setView('editDay')
  }

  function saveDayName() {
    if (!selectedRoutine || !selectedDay || !editingDayName.trim()) return
    const updated = {
      ...selectedRoutine,
      days: selectedRoutine.days.map(d =>
        d.id === selectedDay.id ? { ...d, name: editingDayName.trim() } : d
      ),
    }
    setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r))
    setSelectedRoutine(updated)
    setSelectedDay(updated.days.find(d => d.id === selectedDay.id) || null)
  }

  function addExercise() {
    if (!selectedRoutine || !selectedDay || !newExercise.trim()) return
    const exercise: Exercise = { id: crypto.randomUUID(), name: newExercise.trim() }
    const updated = {
      ...selectedRoutine,
      days: selectedRoutine.days.map(d =>
        d.id === selectedDay.id
          ? { ...d, exercises: [...d.exercises, exercise] }
          : d
      ),
    }
    setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r))
    setSelectedRoutine(updated)
    setSelectedDay(updated.days.find(d => d.id === selectedDay.id) || null)
    setNewExercise('')
  }

  function deleteExercise(exerciseId: string) {
    if (!selectedRoutine || !selectedDay) return
    const updated = {
      ...selectedRoutine,
      days: selectedRoutine.days.map(d =>
        d.id === selectedDay.id
          ? { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
          : d
      ),
    }
    setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r))
    setSelectedRoutine(updated)
    setSelectedDay(updated.days.find(d => d.id === selectedDay.id) || null)
  }

  // ─── Workout session ──────────────────────────────────────

  function startWorkout(routine: Routine, day: WorkoutDay) {
    setSelectedRoutine(routine)
    setSelectedDay(day)
    setSessionLog(day.exercises.map(e => ({ exerciseId: e.id, sets: [] })))
    setActiveExercise(null)
    setView('workout')
  }

  function addSet(exerciseId: string) {
    const reps = parseInt(newSet.reps)
    const weight = parseFloat(newSet.weight)
    if (isNaN(reps) || isNaN(weight)) return
    setSessionLog(prev => prev.map(l =>
      l.exerciseId === exerciseId
        ? { ...l, sets: [...l.sets, { reps, weight }] }
        : l
    ))
    setNewSet({ reps: '', weight: '' })
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setSessionLog(prev => prev.map(l =>
      l.exerciseId === exerciseId
        ? { ...l, sets: l.sets.filter((_, i) => i !== setIndex) }
        : l
    ))
  }

  function finishWorkout() {
    if (!selectedRoutine || !selectedDay) return
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      profileId,
      routineId: selectedRoutine.id,
      dayId: selectedDay.id,
      date: new Date().toISOString(),
      exercises: sessionLog,
    }
    setLogs(prev => [...prev, log])
    setView('home')
  }

  // ─── Render ───────────────────────────────────────────────

  // Create routine view
  if (view === 'createRoutine') {
    return (
      <div style={{ padding: '1.25rem' }}>
        <button onClick={() => setView('home')} style={backBtnStyle}>
          <ChevronLeft size={16} /> Volver
        </button>
        <div style={{ ...titleStyle, marginBottom: '1.5rem' }}>Nueva rutina</div>

        <label style={labelStyle}>Nombre</label>
        <input
          value={routineName}
          onChange={e => setRoutineName(e.target.value)}
          placeholder="Ej: Push Pull Legs"
          style={inputStyle}
          autoFocus
        />

        <label style={{ ...labelStyle, marginTop: '1rem' }}>Días por semana</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => setNumDays(n)}
              style={{
                ...pillBtnStyle,
                background: numDays === n ? '#ff3d4d' : '#111520',
                color: numDays === n ? '#fff' : '#7a8098',
                border: `1px solid ${numDays === n ? '#ff3d4d' : '#242840'}`,
              }}>
              {n}
            </button>
          ))}
        </div>

        <button onClick={createRoutine} style={primaryBtnStyle}>
          <Check size={16} /> Crear rutina
        </button>
      </div>
    )
  }

  // Edit day view
  if (view === 'editDay' && selectedRoutine && selectedDay) {
    return (
      <div style={{ padding: '1.25rem' }}>
        <button onClick={() => setView('home')} style={backBtnStyle}>
          <ChevronLeft size={16} /> Volver
        </button>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', alignItems: 'center' }}>
          <input
            value={editingDayName}
            onChange={e => setEditingDayName(e.target.value)}
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
          />
          <button onClick={saveDayName} style={{ ...primaryBtnStyle, padding: '8px 12px', marginBottom: 0 }}>
            <Check size={14} />
          </button>
        </div>

        <label style={labelStyle}>Ejercicios</label>

        <div style={{ marginBottom: '1rem' }}>
          {selectedDay.exercises.map(ex => (
            <div key={ex.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px',
              background: '#111520', borderBottom: '1px solid #1c2030',
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: '#cdd0de' }}>
                {ex.name}
              </span>
              <button onClick={() => deleteExercise(ex.id)} style={iconBtnStyle}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newExercise}
            onChange={e => setNewExercise(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExercise()}
            placeholder="Nombre del ejercicio"
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
          />
          <button onClick={addExercise} style={{ ...primaryBtnStyle, padding: '8px 12px', marginBottom: 0 }}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Workout session view
  if (view === 'workout' && selectedRoutine && selectedDay) {
    return (
      <div style={{ padding: '1.25rem' }}>
        <button onClick={() => setView('home')} style={backBtnStyle}>
          <ChevronLeft size={16} /> Cancelar
        </button>
        <div style={titleStyle}>{selectedDay.name}</div>
        <div style={{ ...subtitleStyle, marginBottom: '1.25rem' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>

        {selectedDay.exercises.map(ex => {
          const log = sessionLog.find(l => l.exerciseId === ex.id)
          const isActive = activeExercise === ex.id
          return (
            <div key={ex.id} style={{
              background: '#111520', border: `1px solid ${isActive ? '#ff3d4d' : '#1c2030'}`,
              borderRadius: 4, marginBottom: 8, overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              <div
                onClick={() => setActiveExercise(isActive ? null : ex.id)}
                style={{
                  padding: '12px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: '#cdd0de' }}>
                  {ex.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#3a4058' }}>
                    {log?.sets.length || 0} series
                  </span>
                  <ChevronRight size={14} color="#3a4058" style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {isActive && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid #1c2030' }}>
                  {log?.sets.map((set, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0', borderBottom: '1px solid #1c2030',
                    }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: '#3a4058' }}>
                        Serie {i + 1}
                      </span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#cdd0de' }}>
                        {set.reps} reps · {set.weight} kg
                      </span>
                      <button onClick={() => removeSet(ex.id, i)} style={iconBtnStyle}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={newSet.reps}
                      onChange={e => setNewSet(prev => ({ ...prev, reps: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, marginBottom: 0, fontSize: 13 }}
                    />
                    <input
                      type="number"
                      placeholder="Kg"
                      value={newSet.weight}
                      onChange={e => setNewSet(prev => ({ ...prev, weight: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, marginBottom: 0, fontSize: 13 }}
                    />
                    <button onClick={() => addSet(ex.id)} style={{ ...primaryBtnStyle, padding: '8px 12px', marginBottom: 0 }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button onClick={finishWorkout} style={{ ...primaryBtnStyle, marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
          <Check size={16} /> Finalizar entrenamiento
        </button>
      </div>
    )
  }

  // Home view
  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={titleStyle}>Rutinas</div>
        <button onClick={() => setView('createRoutine')} style={primaryBtnStyle}>
          <Plus size={16} /> Nueva
        </button>
      </div>

      {myRoutines.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, color: '#3a4058',
        }}>
          No tienes rutinas. Crea una para empezar.
        </div>
      )}

      {myRoutines.map(routine => (
        <div key={routine.id} style={{
          background: '#111520', border: '1px solid #1c2030',
          borderRadius: 4, marginBottom: '1rem', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 14px', borderBottom: '1px solid #1c2030',
          }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#cdd0de', letterSpacing: 1 }}>
              {routine.name}
            </span>
            <button onClick={() => deleteRoutine(routine.id)} style={iconBtnStyle}>
              <Trash2 size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1, background: '#1c2030' }}>
            {routine.days.map(day => (
              <div key={day.id} style={{ background: '#111520', padding: '12px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: '#cdd0de', marginBottom: 4 }}>
                  {day.name}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#3a4058', marginBottom: 10 }}>
                  {day.exercises.length} ejercicios
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEditDay(routine, day)}
                    style={{ ...iconBtnStyle, fontSize: 10, gap: 4, display: 'flex', alignItems: 'center' }}>
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => startWorkout(routine, day)}
                    style={{
                      flex: 1, background: '#ff3d4d', border: 'none',
                      borderRadius: 3, padding: '4px 6px',
                      cursor: 'pointer', color: '#fff',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 10, letterSpacing: 0.5,
                    }}>
                    Entrenar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent logs for this routine */}
          {myLogs.filter(l => l.routineId === routine.id).length > 0 && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #1c2030' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, color: '#3a4058', marginBottom: 6 }}>
                ÚLTIMOS ENTRENAMIENTOS
              </div>
              {myLogs.filter(l => l.routineId === routine.id).slice(-3).reverse().map(log => {
                const day = routine.days.find(d => d.id === log.dayId)
                const totalSets = log.exercises.reduce((acc, e) => acc + e.sets.length, 0)
                return (
                  <div key={log.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12, color: '#7a8098', marginBottom: 3,
                  }}>
                    <span>{day?.name || 'Día'} · {totalSets} series</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>{new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                      <button
                        onClick={() => {
                          setSelectedRoutine(routine)
                          setSelectedDay(day || null)
                          setSessionLog(log.exercises)
                          setActiveExercise(null)
                          deleteLog(log.id)
                          setView('workout')
                        }}
                        style={{ ...iconBtnStyle, color: '#3a4058' }}
                        title="Editar">
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteLog(log.id)}
                        style={{ ...iconBtnStyle, color: '#3a4058' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff3d4d'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3a4058'}
                        title="Borrar">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────

const titleStyle: React.CSSProperties = {
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 22, fontWeight: 700,
  color: '#cdd0de', letterSpacing: 1,
  marginBottom: '0.25rem',
}

const subtitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 12, color: '#3a4058',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 11, letterSpacing: 2,
  color: '#3a4058', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111520', border: '1px solid #242840',
  color: '#cdd0de', padding: '10px 12px',
  borderRadius: 3, fontSize: 14,
  fontFamily: "'Barlow Condensed', sans-serif",
  outline: 'none', marginBottom: '0.75rem',
}

const primaryBtnStyle: React.CSSProperties = {
  background: '#ff3d4d', border: 'none',
  borderRadius: 3, padding: '10px 16px',
  cursor: 'pointer', color: '#fff',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 13, letterSpacing: 1, fontWeight: 700,
  display: 'flex', alignItems: 'center', gap: 6,
  marginBottom: '0.75rem',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none',
  cursor: 'pointer', color: '#3a4058',
  padding: 0, display: 'flex', alignItems: 'center',
}

const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none',
  cursor: 'pointer', color: '#7a8098',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 13, letterSpacing: 1,
  display: 'flex', alignItems: 'center', gap: 4,
  marginBottom: '1.25rem', padding: 0,
}

const pillBtnStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 3,
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 18, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}