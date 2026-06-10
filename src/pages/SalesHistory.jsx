import React, { useState, useMemo } from 'react'
import { Search, X, Calendar, ShoppingBag, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SaleRow from '../components/SaleRow'
import { formatCOP, formatDateTime } from '../utils/format'

export default function SalesHistory() {
  const { sales, deleteSale } = useApp()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return sales
      .filter(sale => {
        const matchSearch = !search ||
          sale.id.toLowerCase().includes(search.toLowerCase()) ||
          sale.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          sale.customer.city.toLowerCase().includes(search.toLowerCase())
        const saleDate = sale.date.split('T')[0]
        const matchFrom = !dateFrom || saleDate >= dateFrom
        const matchTo = !dateTo || saleDate <= dateTo
        return matchSearch && matchFrom && matchTo
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sales, search, dateFrom, dateTo])

  const totalFiltered = filtered.reduce((s, sale) => s + sale.total, 0)

  function clearFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
  }

  function exportCSV() {
    const rows = [
      ['ID', 'Fecha', 'Cliente', 'Celular', 'Dirección', 'Ciudad', 'Productos', 'Subtotal', 'Descuento', 'Domicilio cliente', 'Costo envío real', 'Total', 'Método pago'],
      ...filtered.map(s => [
        s.id,
        formatDateTime(s.date),
        s.customer.name,
        s.customer.phone || '',
        s.customer.address || '',
        s.customer.city,
        s.items.map(i => `${i.name}${i.variantSize ? ` (${i.variantSize})` : ''} x${i.qty}`).join(' | '),
        s.subtotal,
        s.discount || 0,
        s.shippingCustomer || 0,
        s.shippingReal || 0,
        s.total,
        s.paymentMethod,
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasFilters = search || dateFrom || dateTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Historial de Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">{sales.length} ventas registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card py-3 px-4 flex items-center gap-3">
            <ShoppingBag size={18} className="text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Filtrado</p>
              <p className="font-bold text-gray-900 text-sm">{formatCOP(totalFiltered)}</p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="btn-secondary disabled:opacity-40"
            title="Exportar ventas a CSV"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Buscar por ID, cliente o ciudad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              title="Desde"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm shrink-0">hasta</span>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              title="Hasta"
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary shrink-0">
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {filtered.length} venta{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtrado)' : ''}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No hay ventas</p>
            <p className="text-xs mt-1">
              {sales.length === 0 ? 'Realiza tu primera venta' : 'Prueba con otros filtros'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sale => (
                  <SaleRow key={sale.id} sale={sale} onDelete={deleteSale} />
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-black text-primary-700">
                      {formatCOP(totalFiltered)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
