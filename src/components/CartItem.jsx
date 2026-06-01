import React from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatCOP } from '../utils/format'

export default function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
          {item.variantSize && (
            <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-1.5 py-0.5 rounded-md">
              {item.variantSize}
            </span>
          )}
        </div>
        <p className="text-xs text-primary-600 font-bold mt-0.5">{formatCOP(item.price)} c/u</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onQtyChange(item.cartKey, item.qty - 1)}
          disabled={item.qty <= 1}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
        <button
          onClick={() => onQtyChange(item.cartKey, item.qty + 1)}
          disabled={item.qty >= item.maxStock}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="shrink-0 w-24 text-right">
        <p className="font-bold text-sm text-gray-900">{formatCOP(item.price * item.qty)}</p>
      </div>

      <button
        onClick={() => onRemove(item.cartKey)}
        className="shrink-0 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
