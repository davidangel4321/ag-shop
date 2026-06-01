import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, CreditCard, Banknote, Trash2 } from 'lucide-react'
import { formatCOP, formatDateTime } from '../utils/format'
import toast from 'react-hot-toast'

export default function SaleRow({ sale, onDelete }) {
  const navigate = useNavigate()

  const methodIcon = sale.paymentMethod === 'Efectivo'
    ? <Banknote size={14} className="text-green-600" />
    : <CreditCard size={14} className="text-blue-600" />

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar la venta ${sale.id}? Esta acción no se puede deshacer.`)) return
    try {
      await onDelete(sale.id)
      toast.success(`Venta ${sale.id} eliminada`)
    } catch {
      toast.error('Error al eliminar la venta')
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/sales/${sale.id}`)}>
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
          {sale.id}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(sale.date)}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{sale.customer.name}</p>
        <p className="text-xs text-gray-400">{sale.customer.city}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          {methodIcon}
          {sale.paymentMethod}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCOP(sale.total)}</td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/sales/${sale.id}`) }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
          >
            <Eye size={13} />
            Ver
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Eliminar venta"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
