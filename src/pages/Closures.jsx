import React, { useMemo, useState } from 'react'
import { Lock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { formatCOP, formatDateTime } from '../utils/format'
import { monthKey, summarize } from '../utils/finance'

function Row({ label, value, tone = 'text-gray-700', bold = false }) {
  return (
    <div className={`flex justify-between py-2 text-sm ${bold ? 'border-t border-gray-200 mt-1 pt-3' : ''}`}>
      <span className={bold ? 'font-bold text-gray-900' : 'text-gray-500'}>{label}</span>
      <span className={`tabular-nums ${bold ? 'text-lg font-black' : 'font-semibold'} ${tone}`}>{value}</span>
    </div>
  )
}

export default function Closures() {
  const { sales, expenses, periods, agencies, closePeriod, currentAgencyId } = useApp()
  const [month, setMonth] = useState(monthKey(new Date().toISOString()))
  const [agencyId, setAgencyId] = useState(currentAgencyId || 'todo')
  const [closing, setClosing] = useState(false)

  const scopeAgency = agencyId === 'todo' ? null : agencyId
  const periodId = `${scopeAgency || 'todo'}_${month}`
  const alreadyClosed = periods.some(p => p.id === periodId)

  const preview = useMemo(
    () => summarize({ sales, expenses, month, agencyId: scopeAgency }),
    [sales, expenses, month, scopeAgency]
  )

  const agencyName = agencyId === 'todo'
    ? 'Todo el negocio'
    : (agencies.find(a => a.id === agencyId)?.name || agencyId)

  async function handleClose() {
    if (!window.confirm(`¿Cerrar ${month} · ${agencyName}? El cierre quedará guardado y no se podrá volver a cerrar.`)) return
    setClosing(true)
    try {
      const result = await closePeriod({ month, agencyId: scopeAgency })
      if (result?.error) toast.error(result.error)
      else toast.success('Período cerrado')
    } catch {
      toast.error('Error al cerrar el período')
    } finally {
      setClosing(false)
    }
  }

  const closed = [...periods].sort((a, b) => (b.closedAt || '').localeCompare(a.closedAt || ''))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-500 mb-1">Finanzas</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cierres de período</h1>
        <p className="text-gray-500 text-sm mt-1">Congela la utilidad de un mes para liquidar sin que cambie después.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector + preview */}
        <div className="card lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mes</label>
              <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} />
            </div>
            <div>
              <label className="label">Alcance</label>
              <select className="input" value={agencyId} onChange={e => setAgencyId(e.target.value)}>
                <option value="todo">Todo el negocio</option>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50/70 ring-1 ring-gray-100 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Vista previa · {agencyName} · {preview.salesCount} ventas
            </p>
            <Row label="Ingresos" value={formatCOP(preview.revenue)} />
            <Row label="Costo de productos" value={`- ${formatCOP(preview.cost)}`} tone="text-gray-600" />
            <Row label="Costo real de envíos" value={`- ${formatCOP(preview.shippingReal)}`} tone="text-gray-600" />
            <Row label="Utilidad bruta" value={formatCOP(preview.grossProfit)} />
            <Row label="Gastos operativos" value={`- ${formatCOP(preview.expenses)}`} tone="text-gray-600" />
            <Row label="Comisiones" value={`- ${formatCOP(preview.commissions)}`} tone="text-gray-600" />
            <Row label="Utilidad neta" value={formatCOP(preview.netProfit)} tone="text-primary-700" bold />
            <p className="text-xs text-gray-400 mt-2">Margen neto: {preview.margin.toFixed(1)}%</p>
          </div>

          {alreadyClosed ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} /> Este período ya está cerrado.
            </div>
          ) : (
            <button
              onClick={handleClose}
              disabled={closing || preview.salesCount === 0 && preview.expenses === 0}
              className="btn-primary w-full justify-center py-3 disabled:opacity-40"
            >
              <Lock size={16} />
              {closing ? 'Cerrando...' : 'Cerrar período'}
            </button>
          )}
        </div>

        {/* Historial de cierres */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Cierres guardados</h2>
          {closed.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no hay cierres.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {closed.map(p => (
                <div key={p.id} className="rounded-xl ring-1 ring-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{p.month}</p>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{p.agencyName}</span>
                  </div>
                  <p className="text-xl font-black text-primary-700 mt-2 tabular-nums">{formatCOP(p.totals?.netProfit || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ingresos {formatCOP(p.totals?.revenue || 0)} · {p.totals?.salesCount || 0} ventas
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Cerrado por {p.closedBy} · {formatDateTime(p.closedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
