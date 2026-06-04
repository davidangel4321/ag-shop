import React from 'react'
import { Edit2, Trash2, AlertTriangle, Package } from 'lucide-react'
import { formatCOP } from '../utils/format'

export default function ProductCard({ product, onEdit, onDelete }) {
  const isLowStock = product.stock > 0 && product.stock < 5
  const isOutOfStock = product.stock === 0
  const margin = product.salePrice > 0
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(0)
    : 0

  return (
    <div className="card flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
      {/* Stock alert ribbon */}
      {(isLowStock || isOutOfStock) && (
        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold ${
          isOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'
        }`}>
          {isOutOfStock ? 'Agotado' : 'Stock bajo'}
        </div>
      )}

      {/* Photo */}
      <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Package size={36} />
            <span className="text-xs">Sin foto</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>
          </div>
          <span className="badge bg-primary-50 text-primary-700 shrink-0">{product.category}</span>
        </div>
        {product.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-primary-50 rounded-lg p-2 text-center text-sm">
        <p className="text-xs text-primary-400 mb-0.5">Precio de venta</p>
        <p className="font-bold text-primary-700">{formatCOP(product.salePrice)}</p>
      </div>

      {/* Stock + margin */}
      {product.variants && product.variants.length > 0 ? (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {product.variants.map((v, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-lg font-semibold border ${
                v.stock === 0 ? 'bg-red-50 text-red-500 border-red-200' :
                v.stock < 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-green-50 text-green-700 border-green-200'
              }`}>
                {v.size}: {v.stock}
              </span>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Total: {product.stock} uds.</span>
            <span className="font-semibold text-green-600">Margen: {margin}%</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {(isLowStock || isOutOfStock) && (
              <AlertTriangle size={12} className={isOutOfStock ? 'text-red-500' : 'text-amber-500'} />
            )}
            <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-600' : 'text-green-600'}`}>
              {product.stock} en stock
            </span>
          </div>
          <span className="font-semibold text-green-600">Margen: {margin}%</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 btn-secondary text-xs py-1.5 justify-center"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 btn-danger text-xs py-1.5 justify-center"
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>
    </div>
  )
}
