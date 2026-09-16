import { useState } from 'react'
import { Plus, X, Check, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useLocalStorage } from '../hooks/useStorage'
import type { WeightEntry } from '../types'

interface Props {
  profileId: string
}

type Range = 'week' | 'month' | 'year'
type ChartType = 'line' | 'bar'

export default function WeightTab({ profileId }: Props) {
  const [entries, setEntries] = useLocalStorage<WeightEntry[]>('weights', [])
  const [showModal, setShowModal] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [range, setRange] = useState<Range>('week')
  const [chartType, setChartType] = useState<ChartType>('line')

  const myEntries = entries.filter(e => e.profileId === profileId)

  function addEntry() {
    const val = parseFloat(weightInput)
    if (isNaN(val) || val <= 0) return
    const entry: WeightEntry = {
      id: crypto.randomUUID(),
      profileId,
      weight: val,
      date: new Date().toISOString(),
    }
    setEntries(prev => [...prev, entry])
    setWeightInput('')
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

  const tooltipStyle = {
    backgroundColor: '#111520',
    border: '1px solid #242840',
    borderRadius: 4,
    color: '#cdd0de',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 13,
  }

  return (
    <div style={{ padding: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 22, fontWeight: 700,
            color: '#cdd0de', letterSpacing: 1,
          }}>Peso</div>
          {latest && (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, color: '#7a8098',
            }}>
              Último: <span style={{ color: '#cdd0de' }}>{latest.weight} kg</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#ff3d4d',
            border: 'none', borderRadius: 4,
            padding: '8px 14px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, letterSpacing: 1,
            color: '#fff', fontWeight: 700,
          }}>
          <Plus size={16} />
          Añadir
        </button>
      </div>

      {/* Stats */}
      {diff !== null && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, marginBottom: '1.25rem',
        }}>
          <div style={{
            background: '#111520', border: '1px solid #1c2030',
            borderRadius: 4, padding: '0.75rem',
          }}>
            <div style={{ fontSize: 11, color: '#3a4058', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 4 }}>
              MÍNIMO
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#cdd0de', fontFamily: "'Rajdhani', sans-serif" }}>
              {Math.min(...filtered.map(e => e.weight))} kg
            </div>
          </div>
          <div style={{
            background: '#111520', border: '1px solid #1c2030',
            borderRadius: 4, padding: '0.75rem',
          }}>
            <div style={{ fontSize: 11, color: '#3a4058', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 4 }}>
              VARIACIÓN
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
              color: parseFloat(diff) < 0 ? '#00c896' : parseFloat(diff) > 0 ? '#ff3d4d' : '#cdd0de',
            }}>
              {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
            </div>
          </div>
        </div>
      )}

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {(['week', 'month', 'year'] as Range[]).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              background: range === r ? '#1c2030' : 'none',
              border: `1px solid ${range === r ? '#242840' : '#1c2030'}`,
              borderRadius: 3, padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, letterSpacing: 1,
              color: range === r ? '#cdd0de' : '#3a4058',
            }}>
            {r === 'week' ? 'Semana' : r === 'month' ? 'Mes' : 'Año'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['line', 'bar'] as ChartType[]).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              style={{
                background: chartType === t ? '#1c2030' : 'none',
                border: `1px solid ${chartType === t ? '#242840' : '#1c2030'}`,
                borderRadius: 3, padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 1,
                color: chartType === t ? '#cdd0de' : '#3a4058',
              }}>
              {t === 'line' ? '∿' : '▬'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <div style={{
          background: '#111520', border: '1px solid #1c2030',
          borderRadius: 4, padding: '1rem 0.5rem',
        }}>
          <ResponsiveContainer width="100%" height={200}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2030" />
                <XAxis dataKey="date" tick={{ fill: '#3a4058', fontSize: 10, fontFamily: 'Barlow Condensed' }} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#3a4058', fontSize: 10, fontFamily: 'Barlow Condensed' }}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone" dataKey="peso"
                  stroke="#ff3d4d" strokeWidth={2}
                  dot={{ fill: '#ff3d4d', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2030" />
                <XAxis dataKey="date" tick={{ fill: '#3a4058', fontSize: 10, fontFamily: 'Barlow Condensed' }} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#3a4058', fontSize: 10, fontFamily: 'Barlow Condensed' }}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="peso" fill="#ff3d4d" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          background: '#111520', border: '1px solid #1c2030',
          borderRadius: 4, padding: '3rem 1rem',
          textAlign: 'center',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, color: '#3a4058',
        }}>
          Añade al menos 2 registros para ver la gráfica
        </div>
      )}

      {/* History */}
      {myEntries.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, letterSpacing: 2,
            color: '#3a4058', marginBottom: 8,
          }}>HISTORIAL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
           {[...myEntries].reverse().slice(0, 10).map(e => (
  <div key={e.id} style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#111520',
    borderBottom: '1px solid #1c2030',
  }}>
    <span style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 12, color: '#7a8098',
    }}>
      {new Date(e.date).toLocaleDateString('es-ES', {
        weekday: 'short', day: '2-digit', month: '2-digit',
      })} · {new Date(e.date).toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit',
      })}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 16, fontWeight: 700, color: '#cdd0de',
      }}>{e.weight} kg</span>
      <button
        onClick={() => setEntries(prev => prev.filter(w => w.id !== e.id))}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', color: '#3a4058',
          padding: 0, display: 'flex', alignItems: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e2 => (e2.currentTarget as HTMLElement).style.color = '#ff3d4d'}
        onMouseLeave={e2 => (e2.currentTarget as HTMLElement).style.color = '#3a4058'}
      >
        <Trash2 size={13} />
      </button>
    </div>
  </div>
))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(7,9,15,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '1rem',
        }}>
          <div style={{
            background: '#0d1018', border: '1px solid #242840',
            borderRadius: 6, padding: '1.5rem', width: '100%', maxWidth: 320,
          }}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 18, fontWeight: 700,
              color: '#cdd0de', marginBottom: '0.5rem',
            }}>Añadir peso</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12, color: '#3a4058', marginBottom: '1.25rem',
            }}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', day: '2-digit', month: 'long',
              })} · {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit', minute: '2-digit',
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEntry()}
                autoFocus
                style={{
                  flex: 1,
                  background: '#111520', border: '1px solid #242840',
                  color: '#cdd0de', padding: '10px 14px',
                  borderRadius: 3, fontSize: 20,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700, outline: 'none',
                }}
              />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14, color: '#7a8098',
              }}>kg</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowModal(false); setWeightInput('') }}
                style={{
                  flex: 1, background: 'none',
                  border: '1px solid #242840', borderRadius: 3,
                  padding: '10px', cursor: 'pointer',
                  color: '#7a8098',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, letterSpacing: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                <X size={14} /> Cancelar
              </button>
              <button
                onClick={addEntry}
                style={{
                  flex: 1, background: '#ff3d4d',
                  border: 'none', borderRadius: 3,
                  padding: '10px', cursor: 'pointer',
                  color: '#fff',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, letterSpacing: 1, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}