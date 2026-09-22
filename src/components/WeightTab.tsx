import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Check, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useLocalStorage } from '../hooks/useStorage'
import { generateId } from '../utils/id'
import type { WeightEntry } from '../types'
import { color, font, radius, springDefault } from '../styles/theme'
import { Card, SectionLabel, ScreenTitle } from './ui/Card'
import { PrimaryButton, SecondaryButton, ChipButton } from './ui/Button'
import { Input } from './ui/Field'
import { Modal } from './ui/Modal'
import { ConfirmDeleteButton } from './ui/ConfirmDeleteButton'
import { Fab } from './ui/Fab'

interface Props {
  profileId: string
}

type Range = 'week' | 'month' | 'year'
type ChartType = 'line' | 'bar'

export default function WeightTab({ profileId }: Props) {
  const [entries, setEntries] = useLocalStorage<WeightEntry[]>('weights', [])
  const [showModal, setShowModal] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightError, setWeightError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('week')
  const [chartType, setChartType] = useState<ChartType>('line')

  const myEntries = entries.filter(e => e.profileId === profileId)

  function addEntry() {
    const val = parseFloat(weightInput)
    if (isNaN(val) || val <= 0) {
      setWeightError('Introduce un peso válido')
      return
    }
    const entry: WeightEntry = {
      id: generateId(),
      profileId,
      weight: val,
      date: new Date().toISOString(),
    }
    setEntries(prev => [...prev, entry])
    setWeightInput('')
    setWeightError(null)
    setShowModal(false)
  }

  function filterByRange(entries: WeightEntry[]): WeightEntry[] {
    const now = new Date()
    const cutoff = new Date()
    if (range === 'week') cutoff.setDate(now.getDate() - 7)
    if (range === 'month') cutoff.setMonth(now.getMonth() - 1)
    if (range === 'year') cutoff.setFullYear(now.getFullYear() - 1)
    return entries.filter(e => new Date(e.date) >= cutoff)
  }

  const filtered = filterByRange(myEntries).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const chartData = filtered.map(e => ({
    date: new Date(e.date).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit',
    }),
    peso: e.weight,
  }))

  const latest = myEntries.at(-1)
  const first = filtered.at(0)
  const last = filtered.at(-1)
  const diff = first && last ? (last.weight - first.weight).toFixed(1) : null
  const diffNum = diff !== null ? parseFloat(diff) : 0
  const TrendIcon = diffNum < 0 ? TrendingDown : diffNum > 0 ? TrendingUp : Minus

  const tooltipStyle = {
    backgroundColor: color.surfaceElevated,
    border: `1px solid ${color.border}`,
    borderRadius: radius.sm,
    color: color.text,
    fontFamily: font.ui,
    fontSize: 13,
  }

  return (
    <div style={{ padding: '1.25rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ScreenTitle subtitle={latest ? <>Último registro: <span style={{ color: color.text, fontWeight: 600 }}>{latest.weight} kg</span></> : undefined}>
          Peso
        </ScreenTitle>
      </div>

      {/* Bottom-anchored: the highest-frequency action on a one-handed, mid-workout screen belongs in the thumb zone, not the header. */}
      <Fab onClick={() => setShowModal(true)} label="Añadir" icon={<Plus size={18} />} />

      {/* Stats */}
      {diff !== null && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: '1.25rem',
        }}>
          <Card style={{ padding: '0.9rem 1rem' }}>
            <SectionLabel style={{ marginBottom: 6 }}>Mínimo</SectionLabel>
            <div style={{ fontSize: 22, fontWeight: 800, color: color.text, fontFamily: font.ui, letterSpacing: -0.4 }}>
              {Math.min(...filtered.map(e => e.weight))} <span style={{ fontSize: 14, fontWeight: 500, color: color.textTertiary }}>kg</span>
            </div>
          </Card>
          <Card style={{ padding: '0.9rem 1rem' }}>
            <SectionLabel style={{ marginBottom: 6 }}>Variación</SectionLabel>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: font.ui, letterSpacing: -0.4,
              display: 'flex', alignItems: 'center', gap: 4,
              color: diffNum < 0 ? color.success : diffNum > 0 ? color.accent : color.text,
            }}>
              <TrendIcon size={17} strokeWidth={2.5} />
              {diffNum > 0 ? '+' : ''}{diff} <span style={{ fontSize: 14, fontWeight: 500, color: color.textTertiary }}>kg</span>
            </div>
          </Card>
        </div>
      )}

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {(['week', 'month', 'year'] as Range[]).map(r => (
          <ChipButton key={r} active={range === r} onClick={() => setRange(r)}>
            {r === 'week' ? 'Semana' : r === 'month' ? 'Mes' : 'Año'}
          </ChipButton>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['line', 'bar'] as ChartType[]).map(t => (
            <ChipButton key={t} active={chartType === t} onClick={() => setChartType(t)} style={{ padding: '6px 12px' }}>
              {t === 'line' ? '∿' : '▬'}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <Card style={{ padding: '1rem 0.5rem' }}>
          <ResponsiveContainer width="100%" height={200}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={color.border} />
                <XAxis dataKey="date" tick={{ fill: color.textTertiary, fontSize: 10, fontFamily: font.ui }} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: color.textTertiary, fontSize: 10, fontFamily: font.ui }}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone" dataKey="peso"
                  stroke={color.accent} strokeWidth={2.5}
                  dot={{ fill: color.accent, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={color.border} />
                <XAxis dataKey="date" tick={{ fill: color.textTertiary, fontSize: 10, fontFamily: font.ui }} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: color.textTertiary, fontSize: 10, fontFamily: font.ui }}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="peso" fill={color.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card style={{
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: font.ui, fontSize: 13.5, color: color.textTertiary }}>
            Añade al menos 2 registros para ver la gráfica
          </div>
        </Card>
      )}

      {/* History */}
      {myEntries.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <SectionLabel style={{ marginBottom: 8, paddingLeft: 4 }}>Historial</SectionLabel>
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <AnimatePresence initial={false}>
              {[...myEntries].reverse().slice(0, 10).map((e, i, arr) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={springDefault}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px', overflow: 'hidden',
                    borderBottom: i < arr.length - 1 ? `1px solid ${color.border}` : 'none',
                  }}>
                  <span style={{
                    fontFamily: font.ui,
                    fontSize: 13, fontWeight: 500, color: color.textSecondary,
                  }}>
                    {new Date(e.date).toLocaleDateString('es-ES', {
                      weekday: 'short', day: '2-digit', month: '2-digit',
                    })} · {new Date(e.date).toLocaleTimeString('es-ES', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontFamily: font.ui,
                      fontSize: 16, fontWeight: 700, color: color.text, letterSpacing: -0.3,
                    }}>{e.weight} kg</span>
                    <ConfirmDeleteButton
                      onConfirm={() => setEntries(prev => prev.filter(w => w.id !== e.id))}
                      label={`el registro de ${e.weight} kg`}
                      size={13}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setWeightInput(''); setWeightError(null) }} label="Añadir peso">
        <div style={{
          fontFamily: font.ui,
          fontSize: 19, fontWeight: 800,
          color: color.text, marginBottom: '0.35rem', letterSpacing: -0.4,
        }}>Añadir peso</div>
        <div style={{
          fontFamily: font.ui,
          fontSize: 13, color: color.textTertiary, marginBottom: '1.4rem',
        }}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long', day: '2-digit', month: 'long',
          })} · {new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit', minute: '2-digit',
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: weightError ? 6 : '1.4rem' }}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="75.5"
            value={weightInput}
            onChange={e => { setWeightInput(e.target.value); setWeightError(null) }}
            onKeyDown={e => e.key === 'Enter' && addEntry()}
            autoFocus
            style={{
              fontSize: 24,
              fontWeight: 800,
              padding: '12px 16px',
              letterSpacing: -0.5,
              boxShadow: weightError ? `0 0 0 2px ${color.accent}` : undefined,
            }}
          />
          <span style={{
            fontFamily: font.ui,
            fontSize: 15, fontWeight: 600, color: color.textSecondary,
          }}>kg</span>
        </div>
        {weightError && (
          <div style={{ fontFamily: font.ui, fontSize: 12.5, fontWeight: 600, color: color.accent, marginBottom: '1.1rem' }}>
            {weightError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton onClick={() => { setShowModal(false); setWeightInput(''); setWeightError(null) }} style={{ flex: 1 }}>
            <X size={14} /> Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={addEntry} style={{ flex: 1 }}>
            <Check size={14} /> Guardar
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  )
}
