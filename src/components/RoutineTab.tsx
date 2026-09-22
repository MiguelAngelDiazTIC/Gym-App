import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Check, Pencil, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import { generateId } from '../utils/id'
import type { Routine, RoutineWeek, WorkoutDay, Exercise, WorkoutLog, ExerciseLog } from '../types'
import { color, font, radius, springDefault, springSnappy } from '../styles/theme'
import { Card, SectionLabel, ScreenTitle } from './ui/Card'
import { PrimaryButton, IconButton } from './ui/Button'
import { Input, Label } from './ui/Field'
import { Disclosure } from './ui/Disclosure'
import { ConfirmDeleteButton } from './ui/ConfirmDeleteButton'
import { Fab } from './ui/Fab'

interface Props {
  profileId: string
}

type View = 'home' | 'createRoutine' | 'editDay' | 'weeks' | 'weekDetail' | 'workout'

// Navigation depth per view — used to tell push (forward) from pop (back) so the
// slide transition direction always matches which way the user is actually going.
const VIEW_DEPTH: Record<View, number> = {
  home: 0, createRoutine: 1, editDay: 1, weeks: 1, weekDetail: 2, workout: 3,
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
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
}

export default function RoutineTab({ profileId }: Props) {
  const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', [])
  const [weeks, setWeeks] = useLocalStorage<RoutineWeek[]>('routineWeeks', [])
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>('workoutLogs', [])

  const [view, setViewRaw] = useState<View>('home')
  const [navDirection, setNavDirection] = useState(1)
  function setView(next: View) {
    setNavDirection(VIEW_DEPTH[next] >= VIEW_DEPTH[view] ? 1 : -1)
    setViewRaw(next)
  }
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<RoutineWeek | null>(null)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  // Create routine
  const [routineName, setRoutineName] = useState('')
  const [numDays, setNumDays] = useState(3)
  const [routineNameError, setRoutineNameError] = useState<string | null>(null)

  // Edit day
  const [editingDayName, setEditingDayName] = useState('')
  const [newExercise, setNewExercise] = useState('')
  const [exerciseError, setExerciseError] = useState<string | null>(null)

  // Workout session
  const [sessionLog, setSessionLog] = useState<ExerciseLog[]>([])
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [newSet, setNewSet] = useState({ reps: '', weight: '' })
  const [setInputError, setSetInputError] = useState<string | null>(null)
  // Set when the workout view was opened via "Pencil" on a past log — finishWorkout()
  // then updates that log in place instead of creating a new one. Nothing about the
  // original log is touched until the edit is actually saved.
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  // Armed by tapping "Cancelar" once when there are unsaved sets — a second,
  // distinct tap on "Descartar" is required to actually discard them. Mirrors
  // the app's own Two-Tap Delete Rule: an in-progress session is worth exactly
  // as much protection as a saved one.
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const myRoutines = routines.filter(r => r.profileId === profileId)
  const myWeeks = weeks.filter(w => w.profileId === profileId)
  const myLogs = logs.filter(l => l.profileId === profileId)

  useEffect(() => {
    if (!confirmDiscard) return
    const t = setTimeout(() => setConfirmDiscard(false), 4000)
    return () => clearTimeout(t)
  }, [confirmDiscard])

  // Migrate legacy logs (no weekId) into an auto-created "Semana 1"
  useEffect(() => {
    const orphanLogs = logs.filter(l => !l.weekId)
    if (orphanLogs.length === 0) return

    setWeeks(prevWeeks => {
      const newWeeks = [...prevWeeks]
      const weekByKey = new Map<string, RoutineWeek>()

      orphanLogs.forEach(log => {
        const key = `${log.profileId}|${log.routineId}`
        if (weekByKey.has(key)) return
        let week = newWeeks.find(w => w.profileId === log.profileId && w.routineId === log.routineId && w.index === 1)
        if (!week) {
          week = {
            id: generateId(),
            profileId: log.profileId,
            routineId: log.routineId,
            index: 1,
            createdAt: log.date,
          }
          newWeeks.push(week)
        }
        weekByKey.set(key, week)
      })

      setLogs(prevLogs => prevLogs.map(l => {
        if (l.weekId) return l
        const week = weekByKey.get(`${l.profileId}|${l.routineId}`)
        return week ? { ...l, weekId: week.id } : l
      }))

      return newWeeks
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function weeksFor(routineId: string) {
    return myWeeks.filter(w => w.routineId === routineId).sort((a, b) => a.index - b.index)
  }

  // ─── Create routine ───────────────────────────────────────

  function createRoutine() {
    if (!routineName.trim()) {
      setRoutineNameError('Escribe un nombre para la rutina')
      return
    }
    const days: WorkoutDay[] = Array.from({ length: numDays }, (_, i) => ({
      id: generateId(),
      name: `Día ${i + 1}`,
      exercises: [],
    }))
    const routine: Routine = {
      id: generateId(),
      profileId,
      name: routineName.trim(),
      days,
    }
    setRoutines(prev => [...prev, routine])
    setSelectedRoutine(routine)
    setRoutineName('')
    setRoutineNameError(null)
    setView('home')
  }

  function deleteLog(logId: string) {
    setLogs(prev => prev.filter(l => l.id !== logId))
  }

  function deleteRoutine(id: string) {
    setRoutines(prev => prev.filter(r => r.id !== id))
    setWeeks(prev => prev.filter(w => w.routineId !== id))
    setLogs(prev => prev.filter(l => l.routineId !== id))
    if (selectedRoutine?.id === id) setSelectedRoutine(null)
  }

  // ─── Edit day (template) ────────────────────────────────────

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
    if (!selectedRoutine || !selectedDay) return
    if (!newExercise.trim()) {
      setExerciseError('Escribe el nombre del ejercicio')
      return
    }
    const exercise: Exercise = { id: generateId(), name: newExercise.trim() }
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
    setExerciseError(null)
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

  // ─── Weeks ──────────────────────────────────────────────────

  function openWeeks(routine: Routine) {
    setSelectedRoutine(routine)
    setView('weeks')
  }

  function addWeek() {
    if (!selectedRoutine) return
    const existing = weeksFor(selectedRoutine.id)
    const maxIndex = existing.reduce((m, w) => Math.max(m, w.index), 0)
    const week: RoutineWeek = {
      id: generateId(),
      profileId,
      routineId: selectedRoutine.id,
      index: maxIndex + 1,
      createdAt: new Date().toISOString(),
    }
    setWeeks(prev => [...prev, week])
    setSelectedWeek(week)
    setView('weekDetail')
  }

  function openWeek(week: RoutineWeek) {
    setSelectedWeek(week)
    setView('weekDetail')
  }

  function deleteWeek(weekId: string) {
    setWeeks(prev => prev.filter(w => w.id !== weekId))
    setLogs(prev => prev.filter(l => l.weekId !== weekId))
    if (selectedWeek?.id === weekId) setSelectedWeek(null)
  }

  // ─── Workout session ──────────────────────────────────────

  function startWorkout(day: WorkoutDay) {
    setSelectedDay(day)
    setSessionLog(day.exercises.map(e => ({ exerciseId: e.id, sets: [] })))
    setActiveExercise(null)
    setEditingLogId(null)
    setConfirmDiscard(false)
    setView('workout')
  }

  function editLog(log: WorkoutLog, day: WorkoutDay | undefined) {
    setSelectedDay(day || null)
    setSessionLog(log.exercises)
    setActiveExercise(null)
    setEditingLogId(log.id)
    setConfirmDiscard(false)
    setView('workout')
  }

  function cancelWorkout() {
    const hasUnsavedSets = sessionLog.some(l => l.sets.length > 0)
    if (!hasUnsavedSets) {
      setView('weekDetail')
      setSetInputError(null)
      return
    }
    setConfirmDiscard(true)
  }

  function discardWorkout() {
    setConfirmDiscard(false)
    setSetInputError(null)
    setView('weekDetail')
  }

  function getPreviousEntry(dayId: string): { log: WorkoutLog; week: RoutineWeek } | undefined {
    if (!selectedRoutine || !selectedWeek) return undefined
    return myLogs
      .filter(l => l.routineId === selectedRoutine.id && l.dayId === dayId)
      .map(l => ({ log: l, week: myWeeks.find(w => w.id === l.weekId) }))
      .filter((x): x is { log: WorkoutLog; week: RoutineWeek } => !!x.week && x.week.index < selectedWeek.index)
      .sort((a, b) => b.week.index - a.week.index || new Date(b.log.date).getTime() - new Date(a.log.date).getTime())[0]
  }

  function addSet(exerciseId: string) {
    const reps = parseInt(newSet.reps)
    const weight = parseFloat(newSet.weight)
    if (isNaN(reps) || isNaN(weight)) {
      setSetInputError('Introduce reps y peso')
      return
    }
    setSessionLog(prev => prev.map(l =>
      l.exerciseId === exerciseId
        ? { ...l, sets: [...l.sets, { id: generateId(), reps, weight }] }
        : l
    ))
    setNewSet({ reps: '', weight: '' })
    setSetInputError(null)
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setSessionLog(prev => prev.map(l =>
      l.exerciseId === exerciseId
        ? { ...l, sets: l.sets.filter((_, i) => i !== setIndex) }
        : l
    ))
  }

  function finishWorkout() {
    if (!selectedRoutine || !selectedWeek || !selectedDay) return
    if (editingLogId) {
      // Editing a past log: only replace its exercises now that the user actually
      // saved — the original log was never touched while the edit was in progress.
      setLogs(prev => prev.map(l => l.id === editingLogId ? { ...l, exercises: sessionLog } : l))
      setEditingLogId(null)
    } else {
      const log: WorkoutLog = {
        id: generateId(),
        profileId,
        routineId: selectedRoutine.id,
        weekId: selectedWeek.id,
        dayId: selectedDay.id,
        date: new Date().toISOString(),
        exercises: sessionLog,
      }
      setLogs(prev => [...prev, log])
    }
    setView('weekDetail')
  }

  const prevEntry = view === 'workout' && selectedDay ? getPreviousEntry(selectedDay.id) : undefined

  // ─── Render ───────────────────────────────────────────────

  return (
    <div style={{ padding: '1.25rem' }}>
      <AnimatePresence mode="wait">

        {/* Create routine view */}
        {view === 'createRoutine' && (
          <motion.div key="create" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <BackButton onClick={() => { setView('home'); setRoutineNameError(null) }}>Volver</BackButton>
            <ScreenTitle>Nueva rutina</ScreenTitle>
            <div style={{ height: 20 }} />

            <Label>Nombre</Label>
            <Input
              value={routineName}
              onChange={e => { setRoutineName(e.target.value); setRoutineNameError(null) }}
              placeholder="Ej: Push Pull Legs"
              autoFocus
              style={{
                marginBottom: routineNameError ? 6 : '1.1rem',
                boxShadow: routineNameError ? `0 0 0 2px ${color.accent}` : undefined,
              }}
            />
            {routineNameError && (
              <div style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 600, color: color.accent, marginBottom: '0.9rem' }}>
                {routineNameError}
              </div>
            )}

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
                    color: numDays === n ? color.accentContrastText : color.textSecondary,
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

        {/* Edit day (template) view */}
        {view === 'editDay' && selectedRoutine && selectedDay && (
          <motion.div key="editDay" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <BackButton onClick={() => { setView('home'); setExerciseError(null) }}>Volver</BackButton>

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
                <AnimatePresence initial={false}>
                  {selectedDay.exercises.map((ex, i, arr) => (
                    <motion.div
                      key={ex.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={springDefault}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', overflow: 'hidden',
                        borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                      }}>
                      <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 500, color: color.text }}>
                        {ex.name}
                      </span>
                      <ConfirmDeleteButton
                        onConfirm={() => deleteExercise(ex.id)}
                        label={`el ejercicio "${ex.name}"`}
                        size={14}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Card>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={newExercise}
                  onChange={e => { setNewExercise(e.target.value); setExerciseError(null) }}
                  onKeyDown={e => e.key === 'Enter' && addExercise()}
                  placeholder="Nombre del ejercicio"
                  style={{ boxShadow: exerciseError ? `0 0 0 2px ${color.accent}` : undefined }}
                />
                {exerciseError && (
                  <div style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 600, color: color.accent, marginTop: 6 }}>
                    {exerciseError}
                  </div>
                )}
              </div>
              <PrimaryButton onClick={addExercise} style={{ padding: '11px 14px' }}>
                <Plus size={16} />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {/* Weeks list for a routine template */}
        {view === 'weeks' && selectedRoutine && (
          <motion.div key="weeks" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <BackButton onClick={() => setView('home')}>Volver</BackButton>

            <div style={{ marginBottom: '1.5rem' }}>
              <ScreenTitle subtitle={selectedRoutine.name}>Semanas</ScreenTitle>
            </div>
            <Fab onClick={addWeek} label="Semana" icon={<Plus size={18} />} />

            {weeksFor(selectedRoutine.id).length === 0 && (
              <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
                  Añade tu primera semana para empezar a entrenar esta rutina
                </div>
              </Card>
            )}

            <AnimatePresence initial={false}>
              {weeksFor(selectedRoutine.id).slice().reverse().map(week => {
                const weekLogs = myLogs.filter(l => l.weekId === week.id)
                return (
                  <Card
                    key={week.id}
                    layout
                    exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
                    onClick={() => openWeek(week)}
                    style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontFamily: font.ui, fontSize: 16, fontWeight: 800, color: color.text, letterSpacing: -0.2 }}>
                          Semana {week.index}
                        </div>
                        <div style={{ fontFamily: font.ui, fontSize: 12, color: color.textTertiary, fontWeight: 500, marginTop: 2 }}>
                          {weekLogs.length} entrenamiento{weekLogs.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteWeek(week.id)}
                          label={`la semana ${week.index} y sus ${weekLogs.length} entrenamiento${weekLogs.length !== 1 ? 's' : ''} registrado${weekLogs.length !== 1 ? 's' : ''}`}
                          size={14}
                        />
                        <ChevronRight size={16} color={color.textTertiary} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Week detail: pick a day to train + this week's logs */}
        {view === 'weekDetail' && selectedRoutine && selectedWeek && (
          <motion.div key="weekDetail" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <BackButton onClick={() => setView('weeks')}>Volver</BackButton>
            <ScreenTitle subtitle={selectedRoutine.name}>Semana {selectedWeek.index}</ScreenTitle>
            <div style={{ height: 20 }} />

            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {selectedRoutine.days.map((day, i, arr) => {
                const dayLogCount = myLogs.filter(l => l.weekId === selectedWeek.id && l.dayId === day.id).length
                return (
                  <div key={day.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: color.text, letterSpacing: -0.1 }}>
                        {day.name}
                      </div>
                      <div style={{ fontFamily: font.ui, fontSize: 11.5, color: color.textTertiary, marginTop: 2, fontWeight: 500 }}>
                        {day.exercises.length} ejercicios{dayLogCount > 0 ? ` · ${dayLogCount} hecho${dayLogCount !== 1 ? 's' : ''}` : ''}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => startWorkout(day)}
                      whileTap={{ scale: 0.94 }}
                      style={{
                        flexShrink: 0, background: color.accentGradient, border: 'none',
                        borderRadius: radius.pill, padding: '8px 16px',
                        cursor: 'pointer', color: color.accentContrastText,
                        fontFamily: font.ui, fontWeight: 700,
                        fontSize: 12.5, letterSpacing: -0.1,
                      }}>
                      Entrenar
                    </motion.button>
                  </div>
                )
              })}
            </Card>

            {myLogs.filter(l => l.weekId === selectedWeek.id).length > 0 && (
              <>
                <SectionLabel style={{ marginBottom: 8 }}>Entrenamientos de esta semana</SectionLabel>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <AnimatePresence initial={false}>
                    {myLogs.filter(l => l.weekId === selectedWeek.id).slice().reverse().map((log, i, arr) => {
                      const day = selectedRoutine.days.find(d => d.id === log.dayId)
                      const totalSets = log.exercises.reduce((acc, e) => acc + e.sets.length, 0)
                      return (
                        <motion.div
                          key={log.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={springDefault}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px', overflow: 'hidden',
                            borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                            fontFamily: font.ui,
                          }}>
                          <span style={{ fontSize: 13, color: color.textSecondary, fontWeight: 500 }}>
                            {day?.name || 'Día'} · {totalSets} series
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: color.textTertiary, fontWeight: 500 }}>
                              {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                            </span>
                            <IconButton onClick={() => editLog(log, day)} label="Editar este entrenamiento" style={{ padding: 3 }}>
                              <Pencil size={12} />
                            </IconButton>
                            <ConfirmDeleteButton
                              onConfirm={() => deleteLog(log.id)}
                              label={`este entrenamiento del ${new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`}
                              size={12}
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </Card>
              </>
            )}
          </motion.div>
        )}

        {/* Workout session view */}
        {view === 'workout' && selectedRoutine && selectedWeek && selectedDay && (
          <motion.div key="workout" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <AnimatePresence mode="popLayout" initial={false}>
              {confirmDiscard ? (
                <motion.div
                  key="confirm-discard"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springSnappy}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: color.textSecondary }}>
                    ¿Descartar cambios?
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setConfirmDiscard(false)}
                    whileTap={{ scale: 0.95 }}
                    transition={springSnappy}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
                      color: color.textSecondary, fontFamily: font.ui, fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4, borderRadius: radius.pill,
                    }}>
                    <X size={13} /> Seguir
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={discardWorkout}
                    whileTap={{ scale: 0.95 }}
                    transition={springSnappy}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
                      color: color.accent, fontFamily: font.ui, fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4, borderRadius: radius.pill,
                    }}>
                    <Check size={13} /> Descartar
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="cancel" layout>
                  <BackButton onClick={cancelWorkout}>Cancelar</BackButton>
                </motion.div>
              )}
            </AnimatePresence>
            <ScreenTitle subtitle={
              editingLogId
                ? 'Editando entrenamiento guardado'
                : `Semana ${selectedWeek.index} · ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}`
            }>
              {selectedDay.name}
            </ScreenTitle>
            <div style={{ height: 20 }} />

            {selectedDay.exercises.map(ex => {
              const log = sessionLog.find(l => l.exerciseId === ex.id)
              const isActive = activeExercise === ex.id
              const prevSets = prevEntry?.log.exercises.find(e => e.exerciseId === ex.id)?.sets
              return (
                <Card key={ex.id} active={isActive} style={{ marginBottom: 8, overflow: 'hidden', padding: 0 }}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onClick={() => { setActiveExercise(isActive ? null : ex.id); setSetInputError(null) }}
                    style={{
                      width: '100%', background: 'none', border: 'none', font: 'inherit', color: 'inherit', textAlign: 'left',
                      padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer', touchAction: 'manipulation',
                      userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                    }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontFamily: font.ui, fontSize: 15.5, fontWeight: 700, color: color.text, letterSpacing: -0.2 }}>
                        {ex.name}
                      </span>
                      {prevSets && prevSets.length > 0 && (
                        <div style={{ fontFamily: font.ui, fontSize: 12, color: color.textTertiary, fontWeight: 500, marginTop: 3 }}>
                          Semana {prevEntry!.week.index}: {prevSets.map(s => `${s.weight}kg×${s.reps}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 500, color: color.textTertiary }}>
                        {log?.sets.length || 0} series
                      </span>
                      <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={springDefault}>
                        <ChevronRight size={15} color={color.textTertiary} />
                      </motion.div>
                    </div>
                  </button>

                  <Disclosure open={isActive}>
                    <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${color.border}` }}>
                      <AnimatePresence initial={false}>
                        {log?.sets.map((set, i) => (
                          <motion.div
                            key={set.id ?? i}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                            transition={springDefault}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '8px 0', borderBottom: `1px solid ${color.border}`, overflow: 'hidden',
                            }}>
                            <span style={{ fontFamily: font.ui, fontSize: 12, color: color.textTertiary, fontWeight: 500 }}>
                              Serie {i + 1}
                            </span>
                            <span style={{ fontFamily: font.ui, fontSize: 13.5, color: color.text, fontWeight: 600 }}>
                              {set.reps} reps · {set.weight} kg
                            </span>
                            <IconButton onClick={() => removeSet(ex.id, i)} label={`Quitar serie ${i + 1}`} style={{ padding: 2 }}>
                              <X size={12} />
                            </IconButton>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Reps"
                          value={newSet.reps}
                          onChange={e => { setNewSet(prev => ({ ...prev, reps: e.target.value })); setSetInputError(null) }}
                          style={{ flex: 1, boxShadow: setInputError ? `0 0 0 2px ${color.accent}` : undefined }}
                        />
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="Kg"
                          value={newSet.weight}
                          onChange={e => { setNewSet(prev => ({ ...prev, weight: e.target.value })); setSetInputError(null) }}
                          style={{ flex: 1, boxShadow: setInputError ? `0 0 0 2px ${color.accent}` : undefined }}
                        />
                        <PrimaryButton onClick={() => addSet(ex.id)} style={{ padding: '10px 14px' }}>
                          <Plus size={14} />
                        </PrimaryButton>
                      </div>
                      {setInputError && (
                        <div style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 600, color: color.accent, marginTop: 6 }}>
                          {setInputError}
                        </div>
                      )}
                    </div>
                  </Disclosure>
                </Card>
              )
            })}

            <PrimaryButton onClick={finishWorkout} style={{ marginTop: '0.5rem', width: '100%' }}>
              <Check size={16} /> {editingLogId ? 'Guardar cambios' : 'Finalizar entrenamiento'}
            </PrimaryButton>
          </motion.div>
        )}

        {/* Home view: routine templates */}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, x: navDirection * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -navDirection * 16 }} transition={springDefault}>
            <div style={{ marginBottom: '1.5rem' }}>
              <ScreenTitle>Rutinas</ScreenTitle>
            </div>
            <Fab onClick={() => setView('createRoutine')} label="Nueva" icon={<Plus size={18} />} />

            {myRoutines.length === 0 && (
              <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
                  No tienes rutinas. Crea una para empezar.
                </div>
              </Card>
            )}

            <AnimatePresence initial={false}>
            {myRoutines.map(routine => (
              <Card
                key={routine.id}
                layout
                exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
                style={{ marginBottom: '1rem', overflow: 'hidden', padding: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderBottom: `1px solid ${color.border}`,
                }}>
                  <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 800, color: color.text, letterSpacing: -0.3 }}>
                    {routine.name}
                  </span>
                  <ConfirmDeleteButton
                    onConfirm={() => deleteRoutine(routine.id)}
                    label={`la rutina "${routine.name}" y sus semanas y entrenamientos`}
                    size={15}
                  />
                </div>

                <div>
                  {routine.days.map((day, i, arr) => (
                    <div key={day.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                      // Was surfaceElevated (a flat, unrelated dark gray) — now a
                      // warm-accent-tinted glass, so it reads as part of the new
                      // system instead of a leftover mismatched chip.
                      background: color.accentSoft, padding: '12px 16px',
                      borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: color.text, letterSpacing: -0.1 }}>
                          {day.name}
                        </div>
                        <div style={{ fontFamily: font.ui, fontSize: 11.5, color: color.textTertiary, marginTop: 2, fontWeight: 500 }}>
                          {day.exercises.length} ejercicios
                        </div>
                      </div>
                      <IconButton
                        onClick={() => openEditDay(routine, day)}
                        label={`Editar ${day.name}`}
                        style={{
                          flexShrink: 0, background: color.surface, border: `1px solid ${color.border}`,
                          borderRadius: radius.pill, padding: '6px 12px', gap: 6,
                        }}>
                        <Pencil size={12} /> Editar
                      </IconButton>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px 16px' }}>
                  <motion.button
                    onClick={() => openWeeks(routine)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', background: color.accentGradient, border: 'none',
                      borderRadius: radius.md, padding: '10px 14px', cursor: 'pointer',
                      color: color.accentContrastText, fontFamily: font.ui, fontWeight: 700, fontSize: 13.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    <CalendarDays size={15} /> Semanas · {weeksFor(routine.id).length}
                  </motion.button>
                </div>
              </Card>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
