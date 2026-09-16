import { useState } from 'react'
import { Plus, X, Check, ChevronLeft, Trash2, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '../hooks/useStorage'
import type { NutritionDay, Meal, MacroEntry } from '../types'

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
      id: crypto.randomUUID(),
      profileId,
      date: today,
      meals: MEAL_ORDER.map(type => ({
        id: crypto.randomUUID(),
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

  // ─── Day view ─────────────────────────────────────────────

  if (view === 'day' && selectedDay) {
    const totals = getTotals(selectedDay)
    const maxKcal = 2500

    return (
      <div style={{ padding: '1.25rem' }}>
        <button onClick={() => setView('home')} style={backBtnStyle}>
          <ChevronLeft size={16} /> Volver
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={titleStyle}>
            {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long', day: '2-digit', month: 'long',
            })}
          </div>
        </div>

        {/* Daily totals */}
        <div style={{
          background: '#111520', border: '1px solid #1c2030',
          borderRadius: 4, padding: '1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: '#3a4058' }}>
              TOTAL DEL DÍA
            </span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#cdd0de' }}>
              {Math.round(totals.kcal)} kcal
            </span>
          </div>

          {/* Kcal bar */}
          <div style={{ background: '#1c2030', borderRadius: 2, height: 4, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: '#ff3d4d',
              width: `${Math.min((totals.kcal / maxKcal) * 100, 100)}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Proteína', value: totals.protein, color: '#ff3d4d' },
              { label: 'Carbos', value: totals.carbs, color: '#e8b84b' },
              { label: 'Grasas', value: totals.fat, color: '#00c896' },
            ].map(macro => (
              <div key={macro.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18, fontWeight: 700,
                  color: macro.color,
                }}>{Math.round(macro.value)}g</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 10, color: '#3a4058', letterSpacing: 1,
                }}>{macro.label}</div>
              </div>
            ))}
          </div>
        </div>

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
            <div key={mealType} style={{
              background: '#111520',
              border: `1px solid ${isActive ? '#ff3d4d' : '#1c2030'}`,
              borderRadius: 4, marginBottom: 8, overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              <div
                onClick={() => setActiveMeal(isActive ? null : mealType)}
                style={{
                  padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: '#cdd0de' }}>
                  {MEAL_LABELS[mealType]}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {meal.items.length > 0 && (
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#7a8098' }}>
                      {Math.round(mealTotals.kcal)} kcal
                    </span>
                  )}
                  <ChevronRight size={14} color="#3a4058" style={{
                    transform: isActive ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }} />
                </div>
              </div>

              {isActive && (
                <div style={{ borderTop: '1px solid #1c2030', padding: '0 14px 14px' }}>

                  {meal.items.map((item, i) => (
                    <div key={i} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #1c2030',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#cdd0de' }}>
                          {item.name}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#3a4058' }}>
                          P: {item.protein}g · C: {item.carbs}g · G: {item.fat}g · {item.kcal}kcal
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(mealType, i)}
                        style={iconBtnStyle}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff3d4d'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3a4058'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {showAddItem && activeMeal === mealType ? (
                    <div style={{ marginTop: 10 }}>
                      <input
                        placeholder="Nombre (ej: Pasta con atún)"
                        value={newItem.name}
                        onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        style={{ ...inputStyle, marginBottom: 8 }}
                        autoFocus
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        {[
                          { key: 'kcal', label: 'Kcal' },
                          { key: 'protein', label: 'Proteína (g)' },
                          { key: 'carbs', label: 'Carbos (g)' },
                          { key: 'fat', label: 'Grasas (g)' },
                        ].map(field => (
                          <div key={field.key}>
                            <div style={{ ...labelStyle, marginBottom: 4 }}>{field.label}</div>
                            <input
                              type="number"
                              placeholder="0"
                              value={newItem[field.key as keyof MacroEntry] || ''}
                              onChange={e => setNewItem(prev => ({
                                ...prev,
                                [field.key]: parseFloat(e.target.value) || 0,
                              }))}
                              style={{ ...inputStyle, marginBottom: 0 }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { setShowAddItem(false); setNewItem({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }) }}
                          style={{ ...secondaryBtnStyle, flex: 1 }}>
                          <X size={14} /> Cancelar
                        </button>
                        <button onClick={addItem} style={{ ...primaryBtnStyle, flex: 1, justifyContent: 'center', marginBottom: 0 }}>
                          <Check size={14} /> Añadir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowAddItem(true); setActiveMeal(mealType) }}
                      style={{ ...secondaryBtnStyle, marginTop: 10, width: '100%', justifyContent: 'center' }}>
                      <Plus size={14} /> Añadir alimento
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Home view ────────────────────────────────────────────

  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={titleStyle}>Nutrición</div>
        <button onClick={createDay} style={primaryBtnStyle}>
          <Plus size={16} /> Añadir día
        </button>
      </div>

      {myDays.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, color: '#3a4058',
        }}>
          No hay días registrados. Añade uno para empezar.
        </div>
      )}

      {[...myDays].reverse().map(day => {
        const totals = getTotals(day)
        const maxKcal = 2500
        return (
          <div
            key={day.id}
            style={{
              background: '#111520', border: '1px solid #1c2030',
              borderRadius: 4, marginBottom: 8, overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#242840'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1c2030'}
          >
            <div
              onClick={() => openDay(day)}
              style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: '#cdd0de' }}>
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long', day: '2-digit', month: 'long',
                  })}
                </span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: '#cdd0de' }}>
                  {Math.round(totals.kcal)} kcal
                </span>
              </div>

              <div style={{ background: '#1c2030', borderRadius: 2, height: 3, marginBottom: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: '#ff3d4d',
                  width: `${Math.min((totals.kcal / maxKcal) * 100, 100)}%`,
                }} />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'P', value: totals.protein, color: '#ff3d4d' },
                  { label: 'C', value: totals.carbs, color: '#e8b84b' },
                  { label: 'G', value: totals.fat, color: '#00c896' },
                ].map(m => (
                  <span key={m.label} style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12, color: '#7a8098',
                  }}>
                    <span style={{ color: m.color, fontWeight: 700 }}>{Math.round(m.value)}g</span> {m.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid #1c2030',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                onClick={e => { e.stopPropagation(); deleteDay(day.id) }}
                style={iconBtnStyle}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff3d4d'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3a4058'}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────

const titleStyle: React.CSSProperties = {
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 22, fontWeight: 700,
  color: '#cdd0de', letterSpacing: 1,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 11, letterSpacing: 2,
  color: '#3a4058', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d1018', border: '1px solid #242840',
  color: '#cdd0de', padding: '8px 12px',
  borderRadius: 3, fontSize: 13,
  fontFamily: "'Barlow Condensed', sans-serif",
  outline: 'none',
}

const primaryBtnStyle: React.CSSProperties = {
  background: '#ff3d4d', border: 'none',
  borderRadius: 3, padding: '8px 14px',
  cursor: 'pointer', color: '#fff',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 13, letterSpacing: 1, fontWeight: 700,
  display: 'flex', alignItems: 'center', gap: 6,
  marginBottom: 0,
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'none', border: '1px solid #242840',
  borderRadius: 3, padding: '8px 14px',
  cursor: 'pointer', color: '#7a8098',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 13, letterSpacing: 1,
  display: 'flex', alignItems: 'center', gap: 6,
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