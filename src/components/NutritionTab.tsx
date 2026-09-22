import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Check, ChevronLeft, Trash2, ChevronRight, Flame } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import { generateId } from '../utils/id'
import type { NutritionDay, Meal, MacroEntry } from '../types'
import { color, font, springDefault } from '../styles/theme'
import { Card, SectionLabel, ScreenTitle } from './ui/Card'
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Button'
import { Input, Label } from './ui/Field'

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
          ? { ...m, items: [...m.items, newItem] }
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

  // ─── Day view ─────────────────────────────────────────────

  if (view === 'day' && selectedDay) {
    const totals = getTotals(selectedDay)
    const maxKcal = 2500

    return (
      <div style={{ padding: '1.25rem' }}>
        <BackButton onClick={() => setView('home')}>Volver</BackButton>

        <div style={{ marginBottom: '1.25rem' }}>
          <ScreenTitle>
            {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long', day: '2-digit', month: 'long',
            })}
          </ScreenTitle>
        </div>

        {/* Daily totals */}
        <Card style={{ padding: '1.1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <SectionLabel>Total del día</SectionLabel>
            <span style={{ fontFamily: font.ui, fontSize: 24, fontWeight: 800, color: color.text, letterSpacing: -0.5 }}>
              {Math.round(totals.kcal)} <span style={{ fontSize: 14, fontWeight: 500, color: color.textTertiary }}>kcal</span>
            </span>
          </div>

          {/* Kcal bar */}
          <div style={{ background: color.border, borderRadius: 3, height: 6, marginBottom: 14, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totals.kcal / maxKcal) * 100, 100)}%` }}
              transition={springDefault}
              style={{ height: '100%', borderRadius: 3, background: color.accentGradient }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Proteína', value: totals.protein, color: color.protein },
              { label: 'Carbos', value: totals.carbs, color: color.carbs },
              { label: 'Grasas', value: totals.fat, color: color.fat },
            ].map(macro => (
              <div key={macro.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: font.ui,
                  fontSize: 19, fontWeight: 800, letterSpacing: -0.3,
                  color: macro.color,
                }}>{Math.round(macro.value)}g</div>
                <div style={{
                  fontFamily: font.ui,
                  fontSize: 11, color: color.textTertiary, fontWeight: 600,
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
            <Card key={mealType} active={isActive} style={{ marginBottom: 8, overflow: 'hidden', padding: 0 }}>
              <div
                onClick={() => setActiveMeal(isActive ? null : mealType)}
                style={{
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
              </div>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springDefault}
                    style={{ overflow: 'hidden' }}>
                    <div style={{ borderTop: `1px solid ${color.border}`, padding: '0 16px 16px' }}>

                      {meal.items.map((item, i) => (
                        <div key={i} style={{
                          padding: '10px 0',
                          borderBottom: `1px solid ${color.border}`,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontFamily: font.ui, fontSize: 13.5, fontWeight: 600, color: color.text }}>
                              {item.name}
                            </div>
                            <div style={{ fontFamily: font.ui, fontSize: 11.5, color: color.textTertiary, marginTop: 1 }}>
                              P: {item.protein}g · C: {item.carbs}g · G: {item.fat}g · {item.kcal}kcal
                            </div>
                          </div>
                          <IconButton onClick={() => deleteItem(mealType, i)} style={{ padding: 4 }}>
                            <Trash2 size={13} />
                          </IconButton>
                        </div>
                      ))}

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
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    )
  }

  // ─── Home view ────────────────────────────────────────────

  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <ScreenTitle>Nutrición</ScreenTitle>
        <PrimaryButton onClick={createDay} style={{ padding: '9px 16px' }}>
          <Plus size={16} /> Añadir día
        </PrimaryButton>
      </div>

      {myDays.length === 0 && (
        <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
            No hay días registrados. Añade uno para empezar.
          </div>
        </Card>
      )}

      {[...myDays].reverse().map(day => {
        const totals = getTotals(day)
        const maxKcal = 2500
        return (
          <Card key={day.id} style={{ marginBottom: 8, overflow: 'hidden', padding: 0 }}>
            <div
              onClick={() => openDay(day)}
              style={{
                padding: '14px 16px', cursor: 'pointer', touchAction: 'manipulation',
                userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: font.ui, fontSize: 14.5, fontWeight: 700, color: color.text, letterSpacing: -0.2 }}>
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long', day: '2-digit', month: 'long',
                  })}
                </span>
                <span style={{ fontFamily: font.ui, fontSize: 17, fontWeight: 800, color: color.text, letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={15} color={color.accent} />
                  {Math.round(totals.kcal)}
                </span>
              </div>

              <div style={{ background: color.border, borderRadius: 2, height: 4, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: color.accentGradient,
                  width: `${Math.min((totals.kcal / maxKcal) * 100, 100)}%`,
                }} />
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
            </div>

            <div style={{
              padding: '8px 16px',
              borderTop: `1px solid ${color.border}`,
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <IconButton onClick={() => deleteDay(day.id)} style={{ padding: 4 }}>
                <Trash2 size={13} />
              </IconButton>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
