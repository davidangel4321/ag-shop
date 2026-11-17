import React, { useMemo, useState } from 'react'
import { Percent } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCOP, formatDateTime } from '../utils/format'
import { commissionBase, monthKey } from '../utils/finance'

export default function Commissions() {
  const { sales, users, currentUser, currentAgencyId, agencies } = useApp()
  const isAdmin = currentUser?.role === 'admin'
  const [month, setMonth] = useState(monthKey(new Date().toISOString()))

  // Ventas del mes dentro del alcance del usuario
  const scoped = useMemo(() => {
    return sales.filter(s => {
      if (monthKey(s.date) !== month) return false
      if (currentAgencyId && s.agencyId !== currentAgencyId) return false
      if (!isAdmin && s.sellerId !== currentUser?.id) return false
      return true
    })
  }, [sales, month, currentAgencyId, isAdmin, currentUser])

  // Resumen por vendedor
  const bySeller = useMemo(() => {
    const map = {}
    scoped.forEach(s => {
      const key = s.sellerId || 'sin-vendedor'
      if (!map[key]) {
        map[key] = {
          id: key,
          name: s.sellerName || 'Sin vendedor',
          pct: s.commissionPct || 0,
          count: 0,
          base: 0,
          commission: 0,
        }
      }
      map[key].count += 1
      map[key].base += commissionBase(s)
      map[key].commission += s.commission || 0
    })
    return Object.values(map).sort((a, b) => b.commission - a.commission)
  }, [scoped])

  const totalCommission = bySeller.reduce((s, r) => s + r.commission, 0)
  const sellersWithPct = users.filter(u => (u.commissionPct || 0) > 0).length
  const agencyName = id => agencies.find(a => a.id === id)?.name || '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-500 mb-1">Equipo comercial</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Comisiones</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Comisiones de todos los vendedores' : 'Tus comisiones por venta'}
          </p>
        </div>
        <input
          type="month"
          className="input sm:w-56"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card !p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total a pagar</p>
          <p className="text-2xl font-black text-primary-700 mt-1 tabular-nums">{formatCOP(totalCommission)}</p>
        </div>
        <div className="card !p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ventas del mes</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{scoped.length}</p>
        </div>
        <div className="card !p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Vendedores con comisión</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{isAdmin ? sellersWithPct : bySeller.length}</p>
        </div>
      </div>

      {/* Resumen por vendedor */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Resumen por vendedor</h2>
        </div>
        {bySeller.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Percent size={36} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold">Sin ventas en este mes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Vendedor</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">% comisión</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Ventas</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Base vendida</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Comisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bySeller.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-semibold text-gray-900">{r.name}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{r.pct}%</td>
                    <td className="py-3 px-4 text-right text-gray-600 tabular-nums">{r.count}</td>
                    <td className="py-3 px-4 text-right text-gray-600 tabular-nums">{formatCOP(r.base)}</td>
                    <td className="py-3 px-4 text-right font-bold text-primary-700 tabular-nums">{formatCOP(r.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle de ventas */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Detalle de ventas</h2>
        </div>
        {scoped.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Sin ventas en este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Venta</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Fecha</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Vendedor</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Agencia</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Base</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Comisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...scoped].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-primary-700">{s.id}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDateTime(s.date)}</td>
                    <td className="py-3 px-4 text-gray-800">{s.sellerName || 'Sin vendedor'}</td>
                    <td className="py-3 px-4 text-gray-500">{agencyName(s.agencyId)}</td>
                    <td className="py-3 px-4 text-right text-gray-600 tabular-nums">{formatCOP(commissionBase(s))}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">{formatCOP(s.commission || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
