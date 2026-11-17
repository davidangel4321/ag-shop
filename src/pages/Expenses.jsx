import React, { useMemo, useState } from 'react'
import { Plus, Trash2, Receipt, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { formatCOP, formatDate } from '../utils/format'

const CATEGORIES = ['Arriendo', 'Nómina', 'Servicios públicos', 'Empaque', 'Publicidad', 'Transporte', 'Mantenimiento', 'Otro']

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

const EMPTY_FORM = { date: todayISO(), category: 'Arriendo', description: '', amount: '', agencyId: '' }

export default function Expenses() {
  const { expenses, agencies, addExpense, deleteExpense, currentAgencyId } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const agencyName = id => agencies.find(a => a.id === id)?.name || '—'

  const visible = useMemo(() => {
    return expenses
      .filter(e => !currentAgencyId || e.agencyId === currentAgencyId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, currentAgencyId])

  const total = visible.reduce((s, e) => s + (e.amount || 0), 0)

  function openForm() {
    setForm({ ...EMPTY_FORM, agencyId: currentAgencyId || '' })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const agencyId = currentAgencyId || form.agencyId
    if (!agencyId) return toast.error('Selecciona la agencia del gasto')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('El monto debe ser mayor a 0')
    setSaving(true)
    try {
      await addExpense({ ...form, agencyId, amount: Number(form.amount) })
      toast.success('Gasto registrado')
      setShowForm(false)
    } catch {
      toast.error('Error al guardar el gasto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(exp) {
    if (!window.confirm(`¿Eliminar el gasto de ${formatCOP(exp.amount)}?`)) return
    try {
      await deleteExpense(exp.id)
      toast.success('Gasto eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-500 mb-1">Finanzas</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gastos operativos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {visible.length} registros · Total <span className="font-bold text-gray-800">{formatCOP(total)}</span>
          </p>
        </div>
        <button onClick={openForm} className="btn-primary self-start sm:self-auto">
          <Plus size={18} /> Nuevo gasto
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Receipt size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Sin gastos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Fecha</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Categoría</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Descripción</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Agencia</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Monto</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4"><span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{exp.category}</span></td>
                    <td className="py-3 px-4 text-gray-700">{exp.description || '—'}</td>
                    <td className="py-3 px-4 text-gray-500">{agencyName(exp.agencyId)}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 tabular-nums">{formatCOP(exp.amount)}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDelete(exp)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">Nuevo gasto</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Monto ($)</label>
                  <input className="input" type="number" min="1" placeholder="150000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descripción</label>
                <input className="input" placeholder="Arriendo local mayo" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {!currentAgencyId && (
                <div>
                  <label className="label">Agencia *</label>
                  <select className="input" value={form.agencyId} onChange={e => setForm(f => ({ ...f, agencyId: e.target.value }))} required>
                    <option value="">Selecciona una agencia</option>
                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
