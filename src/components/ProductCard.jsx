import React from 'react'
import { Edit2, Trash2, Package } from 'lucide-react'
import { formatCOP } from '../utils/format'

export default function ProductCard({ product, onEdit, onDelete }) {
  const hasVariants = product.variants && product.variants.length > 0
  const isLowStock = product.stock > 0 && product.stock < 5
  const isOutOfStock = product.stock === 0
  const margin = product.salePrice > 0
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(0)
    : 0

  const status = isOutOfStock
    ? { label: 'Agotado', cls: 'bg-red-600 text-white' }
    : isLowStock
      ? { label: 'Stock bajo', cls: 'bg-amber-400 text-amber-950' }
      : null

  const stockTone = isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
  const barTone = isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-400' : 'bg-emerald-500'
  const barPct = Math.min(100, (product.stock / 20) * 100)

  return (
    <div className="group card !p-3 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <Package size={32} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-wide uppercase">Sin foto</span>
          </div>
        )}

        {status && (
          <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${status.cls}`}>
            {status.label}
          </span>
        )}
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-gray-700 shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="px-1 flex-1 flex flex-col gap-1.5">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 leading-snug truncate">{product.name}</p>
          <p className="text-[11px] font-mono tracking-wider text-gray-400 mt-0.5">{product.sku}</p>
        </div>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {/* Variants */}
        {hasVariants && (
          <div className="flex flex-wrap gap-1 pt-1">
            {product.variants.map((v, i) => (
              <span
                key={i}
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ring-1 ${
                  v.stock === 0 ? 'bg-red-50 text-red-600 ring-red-200' :
                  v.stock < 3 ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                  'bg-gray-50 text-gray-700 ring-gray-200'
                }`}
              >
                {v.size} · {v.stock}
              </span>
            ))}
          </div>
        )}

        {/* Stock */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Stock</span>
            <span className={`font-bold tabular-nums ${stockTone}`}>
              {product.stock} uds.
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full ${barTone} transition-all duration-500`} style={{ width: `${barPct}%` }} />
          </div>
        </div>
      </div>

      {/* Price strip */}
      <div className="mx-1 flex items-center justify-between rounded-xl bg-gradient-to-r from-primary-50 to-white px-3 py-2.5 ring-1 ring-primary-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-500">Precio</p>
          <p className="font-black text-primary-800 tabular-nums">{formatCOP(product.salePrice)}</p>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
          {margin}% margen
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 px-1 pb-1">
        <button
          onClick={() => onEdit(product)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200 transition-colors"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>
    </div>
  )
}
