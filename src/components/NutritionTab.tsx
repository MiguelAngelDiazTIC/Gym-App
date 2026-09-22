import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Check, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import { generateId } from '../utils/id'
import type { NutritionDay, Meal, MacroEntry } from '../types'
import { color, font, springDefault } from '../styles/theme'
import { Card, SectionLabel, ScreenTitle } from './ui/Card'
import { PrimaryButton, SecondaryButton } from './ui/Button'
import { Input, Label } from './ui/Field'
import { Disclosure } from './ui/Disclosure'
import { ConfirmDeleteButton } from './ui/ConfirmDeleteButton'
import { Fab } from './ui/Fab'
import { RingProgress } from './ui/RingProgress'

interface Props {
  profileId: string
}

type MealType = Meal['type']
type View = 'home' | 'day'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  snack: 'Merienda',
  dinner: 'Cena',
  extra: 'Extra',
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner', 'extra']

export default function NutritionTab({ profileId }: Props) {
  const [days, setDays] = useLocalStorage<NutritionDay[]>('nutritionDays', [])
  const [view, setView] = useState<View>('home')
  const [selectedDay, setSelectedDay] = useState<NutritionDay | null>(null)
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState<MacroEntry>({
    name: '', kcal: 0, protein: 0, carbs: 0, fat: 0,
  })

  const myDays = days.filter(d => d.profileId === profileId)

  // ─── Helpers ──────────────────────────────────────────────

  function createDay() {
    const today = new Date().toISOString().split('T')[0]
    const existing = myDays.find(d => d.date === today)
    if (existing) {
      setSelectedDay(existing)
      setView('day')
      return
    }
    const day: NutritionDay = {
      id: generateId(),
      profileId,
      date: today,
      meals: MEAL_ORDER.map(type => ({
        id: generateId(),
        type,
        items: [],
      })),
    }
    setDays(prev => [...prev, day])
    setSelectedDay(day)
    setView('day')
  }

  function openDay(day: NutritionDay) {
    setSelectedDay(day)
    setView('day')
  }

  function deleteDay(id: string) {
    setDays(prev => prev.filter(d => d.id !== id))
    if (selectedDay?.id === id) {
      setSelectedDay(null)
      setView('home')
    }
  }

  function addItem() {
    if (!selectedDay || !activeMeal || !newItem.name.trim()) return
    const updatedDay: NutritionDay = {
      ...selectedDay,
      meals: selectedDay.meals.map(m =>
        m.type === activeMeal
          ? { ...m, items: [...m.items, { ...newItem, id: generateId() }] }
          : m
      ),
    }
    setDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d))
    setSelectedDay(updatedDay)
    setNewItem({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShowAddItem(false)
  }

  function deleteItem(mealType: MealType, itemIndex: number) {
    if (!selectedDay) return
    const updatedDay: NutritionDay = {
      ...selectedDay,
      meals: selectedDay.meals.map(m =>
        m.type === mealType
          ? { ...m, items: m.items.filter((_, i) => i !== itemIndex) }
          : m
      ),
    }
    setDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d))
    setSelectedDay(updatedDay)
  }

  function getTotals(day: NutritionDay) {
    return day.meals.reduce((acc, meal) => {
      meal.items.forEach(item => {
        acc.kcal += item.kcal
        acc.protein += item.protein
        acc.carbs += item.carbs
        acc.fat += item.fat
      })
      return acc
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })
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

  const macroFields: { key: keyof MacroEntry; label: string }[] = [
    { key: 'kcal', label: 'Kcal' },
    { key: 'protein', label: 'Proteína (g)' },
    { key: 'carbs', label: 'Carbos (g)' },
    { key: 'fat', label: 'Grasas (g)' },
  ]

  // ─── Render ───────────────────────────────────────────────
  // Day and home are siblings of a fixed depth-2 stack (day is always the
  // "deeper" screen), so each side can hardcode its own enter/exit direction.

  return (
    <div style={{ padding: '1.25rem' }}>
      <AnimatePresence mode="wait">
        {view === 'day' && selectedDay ? (
          <motion.div key="day" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={springDefault}>
            {(() => {
              const totals = getTotals(selectedDay)
              const maxKcal = 2500

              return (
                <>
                  <BackButton onClick={() => setView('home')}>Volver</BackButton>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <ScreenTitle>
                      {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('es-ES', {
                        weekday: 'long', day: '2-digit', month: 'long',
                      })}
                    </ScreenTitle>
                  </div>

                  {/* Daily totals — minimalist pass: ring instead of a linear bar, more air */}
                  <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                      <RingProgress value={totals.kcal / maxKcal} size={88} strokeWidth={9}>
                        <span style={{ fontFamily: font.ui, fontSize: 19, fontWeight: 800, color: color.text, letterSpacing: -0.3 }}>
                          {Math.round(Math.min((totals.kcal / maxKcal) * 100, 100))}%
                        </span>
                      </RingProgress>
                      <div style={{ minWidth: 0 }}>
                        <SectionLabel style={{ marginBottom: 6 }}>Total del día</SectionLabel>
                        <div style={{ fontFamily: font.ui, fontSize: 28, fontWeight: 800, color: color.text, letterSpacing: -0.5 }}>
                          {Math.round(totals.kcal)}
                          <span style={{ fontSize: 15, fontWeight: 500, color: color.textTertiary }}> / {maxKcal} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      {[
                        { label: 'Proteína', value: totals.protein, color: color.protein },
                        { label: 'Carbos', value: totals.carbs, color: color.carbs },
                        { label: 'Grasas', value: totals.fat, color: color.fat },
                      ].map(macro => (
                        <div key={macro.label} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{
                            fontFamily: font.ui,
                            fontSize: 19, fontWeight: 800, letterSpacing: -0.3,
                            color: macro.color,
                          }}>{Math.round(macro.value)}g</div>
                          <div style={{
                            fontFamily: font.ui,
                            fontSize: 11, color: color.textTertiary, fontWeight: 600, marginTop: 2,
                          }}>{macro.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Meals */}
                  {MEAL_ORDER.map(mealType => {
                    const meal = selectedDay.meals.find(m => m.type === mealType)
                    if (!meal) return null
                    const mealTotals = meal.items.reduce(
                      (acc, i) => ({ kcal: acc.kcal + i.kcal, protein: acc.protein + i.protein, carbs: acc.carbs + i.carbs, fat: acc.fat + i.fat }),
                      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
                    )
                    const isActive = activeMeal === mealType

                    return (
                      <Card key={mealType} active={isActive} style={{ marginBottom: 12, overflow: 'hidden', padding: 0 }}>
                        <button
                          type="button"
                          aria-expanded={isActive}
                          onClick={() => setActiveMeal(isActive ? null : mealType)}
                          style={{
                            width: '100%', background: 'none', border: 'none', font: 'inherit', color: 'inherit', textAlign: 'left',
                            padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer', touchAction: 'manipulation',
                            userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                          }}>
                          <span style={{ fontFamily: font.ui, fontSize: 15, fontWeight: 700, color: color.text, letterSpacing: -0.2 }}>
                            {MEAL_LABELS[mealType]}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {meal.items.length > 0 && (
                              <span style={{ fontFamily: font.ui, fontSize: 12, color: color.textSecondary, fontWeight: 500 }}>
                                {Math.round(mealTotals.kcal)} kcal
                              </span>
                            )}
                            <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={springDefault}>
                              <ChevronRight size={15} color={color.textTertiary} />
                            </motion.div>
                          </div>
                        </button>

                        <Disclosure open={isActive}>
                          <div style={{ borderTop: `1px solid ${color.border}`, padding: '0 16px 16px' }}>

                            <AnimatePresence initial={false}>
                              {meal.items.map((item, i) => (
                                <motion.div
                                  key={item.id ?? i}
                                  layout
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                                  transition={springDefault}
                                  style={{
                                    padding: '10px 0',
                                    borderBottom: `1px solid ${color.border}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    overflow: 'hidden',
                                  }}>
                                  <div>
                                    <div style={{ fontFamily: font.ui, fontSize: 13.5, fontWeight: 600, color: color.text }}>
                                      {item.name}
                                    </div>
                                    <div style={{ fontFamily: font.ui, fontSize: 11.5, color: color.textTertiary, marginTop: 1 }}>
                                      P: {item.protein}g · C: {item.carbs}g · G: {item.fat}g · {item.kcal}kcal
                                    </div>
                                  </div>
                                  <ConfirmDeleteButton
                                    onConfirm={() => deleteItem(mealType, i)}
                                    label={`"${item.name}"`}
                                    size={13}
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {showAddItem && activeMeal === mealType ? (
                              <div style={{ marginTop: 12 }}>
                                <Input
                                  placeholder="Nombre (ej: Pasta con atún)"
                                  value={newItem.name}
                                  onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                  style={{ marginBottom: 8 }}
                                  autoFocus
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                  {macroFields.map(field => (
                                    <div key={field.key}>
                                      <Label>{field.label}</Label>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={newItem[field.key] || ''}
                                        onChange={e => setNewItem(prev => ({
                                          ...prev,
                                          [field.key]: parseFloat(e.target.value) || 0,
                                        }))}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <SecondaryButton
                                    onClick={() => { setShowAddItem(false); setNewItem({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }) }}
                                    style={{ flex: 1 }}>
                                    <X size={14} /> Cancelar
                                  </SecondaryButton>
                                  <PrimaryButton onClick={addItem} style={{ flex: 1 }}>
                                    <Check size={14} /> Añadir
                                  </PrimaryButton>
                                </div>
                              </div>
                            ) : (
                              <SecondaryButton
                                onClick={() => { setShowAddItem(true); setActiveMeal(mealType) }}
                                style={{ marginTop: 12, width: '100%' }}>
                                <Plus size={14} /> Añadir alimento
                              </SecondaryButton>
                            )}
                          </div>
                        </Disclosure>
                      </Card>
                    )
                  })}
                </>
              )
            })()}
          </motion.div>
        ) : (
          <motion.div key="home" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={springDefault}>
            <div style={{ marginBottom: '1.5rem' }}>
              <ScreenTitle>Nutrición</ScreenTitle>
            </div>
            <Fab onClick={createDay} label="Añadir día" icon={<Plus size={18} />} />

            {myDays.length === 0 && (
              <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
                  No hay días registrados. Añade uno para empezar.
                </div>
              </Card>
            )}

            <AnimatePresence initial={false}>
              {[...myDays].reverse().map(day => {
                const totals = getTotals(day)
                const maxKcal = 2500
                return (
                  <Card
                    key={day.id}
                    layout
                    exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
                    style={{ marginBottom: 12, overflow: 'hidden', padding: 0 }}>
                    <button
                      type="button"
                      onClick={() => openDay(day)}
                      style={{
                        width: '100%', display: 'block', background: 'none', border: 'none',
                        font: 'inherit', color: 'inherit', textAlign: 'left',
                        padding: '14px 16px', cursor: 'pointer', touchAction: 'manipulation',
                        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <RingProgress value={totals.kcal / maxKcal} size={40} strokeWidth={4.5}>
                          <Flame size={15} color={color.accent} />
                        </RingProgress>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: color.text, letterSpacing: -0.2 }}>
                            {new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', {
                              weekday: 'long', day: '2-digit', month: 'long',
                            })}
                          </span>
                          <span style={{ fontFamily: font.ui, fontSize: 17, fontWeight: 800, color: color.text, letterSpacing: -0.3 }}>
                            {Math.round(totals.kcal)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        {[
                          { label: 'P', value: totals.protein, color: color.protein },
                          { label: 'C', value: totals.carbs, color: color.carbs },
                          { label: 'G', value: totals.fat, color: color.fat },
                        ].map(m => (
                          <span key={m.label} style={{
                            fontFamily: font.ui,
                            fontSize: 12.5, color: color.textSecondary, fontWeight: 500,
                          }}>
                            <span style={{ color: m.color, fontWeight: 700 }}>{Math.round(m.value)}g</span> {m.label}
                          </span>
                        ))}
                      </div>
                    </button>

                    <div style={{
                      padding: '8px 16px',
                      borderTop: `1px solid ${color.border}`,
                      display: 'flex', justifyContent: 'flex-end',
                    }}>
                      <ConfirmDeleteButton
                        onConfirm={() => deleteDay(day.id)}
                        label={`el día ${new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} y sus comidas registradas`}
                        size={13}
                      />
                    </div>
                  </Card>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
