import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Check, Pencil, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import type { Routine, WorkoutDay, Exercise, WorkoutLog, ExerciseLog } from '../types'
import { color, font, radius, springDefault } from '../styles/theme'
import { Card, SectionLabel, ScreenTitle } from './ui/Card'
import { PrimaryButton, IconButton } from './ui/Button'
import { Input, Label } from './ui/Field'

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

  const BackButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95, x: -2 }}
      style={{
        background: 'none', border: 'none',
        cursor: 'pointer', color: color.textSecondary,
        fontFamily: font.ui, fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 2,
        marginBottom: '1.25rem', padding: 0,
      }}>
      <ChevronLeft size={18} /> {children}
    </motion.button>
  )

  // ─── Render ───────────────────────────────────────────────

  return (
    <div style={{ padding: '1.25rem' }}>
      <AnimatePresence mode="wait">

        {/* Create routine view */}
        {view === 'createRoutine' && (
          <motion.div key="create" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={springDefault}>
            <BackButton onClick={() => setView('home')}>Volver</BackButton>
            <ScreenTitle>Nueva rutina</ScreenTitle>
            <div style={{ height: 20 }} />

            <Label>Nombre</Label>
            <Input
              value={routineName}
              onChange={e => setRoutineName(e.target.value)}
              placeholder="Ej: Push Pull Legs"
              autoFocus
              style={{ marginBottom: '1.1rem' }}
            />

            <Label>Días por semana</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 1.75rem' }}>
              {[2, 3, 4, 5, 6].map(n => (
                <motion.button
                  key={n}
                  onClick={() => setNumDays(n)}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 46, height: 46, borderRadius: radius.md,
                    cursor: 'pointer', border: 'none',
                    fontFamily: font.ui, fontSize: 17, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: numDays === n ? color.accentGradient : color.surface,
                    color: numDays === n ? '#fff' : color.textSecondary,
                    outline: numDays === n ? 'none' : `1px solid ${color.border}`,
                  }}>
                  {n}
                </motion.button>
              ))}
            </div>

            <PrimaryButton onClick={createRoutine} style={{ width: '100%' }}>
              <Check size={16} /> Crear rutina
            </PrimaryButton>
          </motion.div>
        )}

        {/* Edit day view */}
        {view === 'editDay' && selectedRoutine && selectedDay && (
          <motion.div key="editDay" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={springDefault}>
            <BackButton onClick={() => setView('home')}>Volver</BackButton>

            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', alignItems: 'center' }}>
              <Input
                value={editingDayName}
                onChange={e => setEditingDayName(e.target.value)}
                style={{ flex: 1 }}
              />
              <PrimaryButton onClick={saveDayName} style={{ padding: '11px 14px' }}>
                <Check size={14} />
              </PrimaryButton>
            </div>

            <Label>Ejercicios</Label>
            <div style={{ margin: '8px 0 1rem' }}>
              <Card style={{ overflow: 'hidden', padding: 0 }}>
                {selectedDay.exercises.length === 0 && (
                  <div style={{ padding: '1.25rem', textAlign: 'center', fontFamily: font.ui, fontSize: 13, color: color.textTertiary }}>
                    Añade ejercicios a este día
                  </div>
                )}
                {selectedDay.exercises.map((ex, i, arr) => (
                  <div key={ex.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                  }}>
                    <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 500, color: color.text }}>
                      {ex.name}
                    </span>
                    <IconButton onClick={() => deleteExercise(ex.id)} style={{ padding: 4 }}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                value={newExercise}
                onChange={e => setNewExercise(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExercise()}
                placeholder="Nombre del ejercicio"
                style={{ flex: 1 }}
              />
              <PrimaryButton onClick={addExercise} style={{ padding: '11px 14px' }}>
                <Plus size={16} />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {/* Workout session view */}
        {view === 'workout' && selectedRoutine && selectedDay && (
          <motion.div key="workout" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={springDefault}>
            <BackButton onClick={() => setView('home')}>Cancelar</BackButton>
            <ScreenTitle subtitle={new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}>
              {selectedDay.name}
            </ScreenTitle>
            <div style={{ height: 20 }} />

            {selectedDay.exercises.map(ex => {
              const log = sessionLog.find(l => l.exerciseId === ex.id)
              const isActive = activeExercise === ex.id
              return (
                <Card key={ex.id} active={isActive} style={{ marginBottom: 8, overflow: 'hidden', padding: 0 }}>
                  <div
                    onClick={() => setActiveExercise(isActive ? null : ex.id)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                    }}>
                    <span style={{ fontFamily: font.ui, fontSize: 15.5, fontWeight: 700, color: color.text, letterSpacing: -0.2 }}>
                      {ex.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 500, color: color.textTertiary }}>
                        {log?.sets.length || 0} series
                      </span>
                      <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={springDefault}>
                        <ChevronRight size={15} color={color.textTertiary} />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springDefault}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${color.border}` }}>
                          {log?.sets.map((set, i) => (
                            <div key={i} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '8px 0', borderBottom: `1px solid ${color.border}`,
                            }}>
                              <span style={{ fontFamily: font.ui, fontSize: 12, color: color.textTertiary, fontWeight: 500 }}>
                                Serie {i + 1}
                              </span>
                              <span style={{ fontFamily: font.ui, fontSize: 13.5, color: color.text, fontWeight: 600 }}>
                                {set.reps} reps · {set.weight} kg
                              </span>
                              <IconButton onClick={() => removeSet(ex.id, i)} style={{ padding: 2 }}>
                                <X size={12} />
                              </IconButton>
                            </div>
                          ))}

                          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={newSet.reps}
                              onChange={e => setNewSet(prev => ({ ...prev, reps: e.target.value }))}
                              style={{ flex: 1, fontSize: 13.5 }}
                            />
                            <Input
                              type="number"
                              placeholder="Kg"
                              value={newSet.weight}
                              onChange={e => setNewSet(prev => ({ ...prev, weight: e.target.value }))}
                              style={{ flex: 1, fontSize: 13.5 }}
                            />
                            <PrimaryButton onClick={() => addSet(ex.id)} style={{ padding: '10px 14px' }}>
                              <Plus size={14} />
                            </PrimaryButton>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )
            })}

            <PrimaryButton onClick={finishWorkout} style={{ marginTop: '0.5rem', width: '100%' }}>
              <Check size={16} /> Finalizar entrenamiento
            </PrimaryButton>
          </motion.div>
        )}

        {/* Home view */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={springDefault}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <ScreenTitle>Rutinas</ScreenTitle>
              <PrimaryButton onClick={() => setView('createRoutine')} style={{ padding: '9px 16px' }}>
                <Plus size={16} /> Nueva
              </PrimaryButton>
            </div>

            {myRoutines.length === 0 && (
              <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
                  No tienes rutinas. Crea una para empezar.
                </div>
              </Card>
            )}

            {myRoutines.map(routine => (
              <Card key={routine.id} style={{ marginBottom: '1rem', overflow: 'hidden', padding: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderBottom: `1px solid ${color.border}`,
                }}>
                  <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 800, color: color.text, letterSpacing: -0.3 }}>
                    {routine.name}
                  </span>
                  <IconButton onClick={() => deleteRoutine(routine.id)} style={{ padding: 4 }}>
                    <Trash2 size={15} />
                  </IconButton>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 1, background: color.border }}>
                  {routine.days.map(day => (
                    <div key={day.id} style={{ background: color.surfaceElevated, padding: '14px' }}>
                      <div style={{ fontFamily: font.ui, fontSize: 13.5, fontWeight: 700, color: color.text, marginBottom: 4, letterSpacing: -0.1 }}>
                        {day.name}
                      </div>
                      <div style={{ fontFamily: font.ui, fontSize: 11.5, color: color.textTertiary, marginBottom: 12, fontWeight: 500 }}>
                        {day.exercises.length} ejercicios
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <IconButton
                          onClick={() => openEditDay(routine, day)}
                          style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.pill, padding: '6px 8px' }}>
                          <Pencil size={12} />
                        </IconButton>
                        <motion.button
                          onClick={() => startWorkout(routine, day)}
                          whileTap={{ scale: 0.94 }}
                          style={{
                            flex: 1, background: color.accentGradient, border: 'none',
                            borderRadius: radius.pill, padding: '6px 8px',
                            cursor: 'pointer', color: '#fff',
                            fontFamily: font.ui, fontWeight: 700,
                            fontSize: 11.5, letterSpacing: -0.1,
                          }}>
                          Entrenar
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent logs for this routine */}
                {myLogs.filter(l => l.routineId === routine.id).length > 0 && (
                  <div style={{ padding: '12px 16px', borderTop: `1px solid ${color.border}` }}>
                    <SectionLabel style={{ marginBottom: 8 }}>Últimos entrenamientos</SectionLabel>
                    {myLogs.filter(l => l.routineId === routine.id).slice(-3).reverse().map(log => {
                      const day = routine.days.find(d => d.id === log.dayId)
                      const totalSets = log.exercises.reduce((acc, e) => acc + e.sets.length, 0)
                      return (
                        <div key={log.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontFamily: font.ui,
                          fontSize: 12.5, color: color.textSecondary, fontWeight: 500,
                          marginBottom: 4,
                        }}>
                          <span>{day?.name || 'Día'} · {totalSets} series</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                            <IconButton
                              onClick={() => {
                                setSelectedRoutine(routine)
                                setSelectedDay(day || null)
                                setSessionLog(log.exercises)
                                setActiveExercise(null)
                                deleteLog(log.id)
                                setView('workout')
                              }}
                              style={{ padding: 3 }}>
                              <Pencil size={12} />
                            </IconButton>
                            <IconButton onClick={() => deleteLog(log.id)} style={{ padding: 3 }}>
                              <Trash2 size={12} />
                            </IconButton>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
