import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, MapPin, Phone, User, CreditCard, Package, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCOP, formatDateTime } from '../utils/format'
import { generateReceipt, generateShippingLabel } from '../utils/pdf'

export default function SaleDetail() {
  const { id } = useParams()
  const { sales } = useApp()
  const navigate = useNavigate()

  const sale = sales.find(s => s.id === id)

  if (!sale) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-400 font-semibold text-lg">Venta no encontrada</p>
        <button onClick={() => navigate('/sales')} className="btn-secondary mx-auto mt-4">
          <ArrowLeft size={16} />
          Volver al historial
        </button>
      </div>
    )
  }

  const cost = sale.items.reduce((s, i) => s + i.cost * i.qty, 0)
  const profit = sale.total - cost - (sale.shippingSubsidy || 0)
  const margin = sale.total > 0 ? (profit / sale.total) * 100 : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/sales')}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-gray-900">{sale.id}</h1>
          <p className="text-gray-500 text-sm">{formatDateTime(sale.date)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateReceipt(sale)}
            className="btn-secondary text-sm"
          >
            <Download size={16} />
            Recibo
          </button>
          <button
            onClick={() => generateShippingLabel(sale)}
            className="btn-primary text-sm"
          >
            <Download size={16} />
            Etiqueta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profit summary */}
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide">Ganancia</p>
          <p className="text-3xl font-black text-primary-700 mt-1">{formatCOP(profit)}</p>
          <p className="text-sm text-primary-500 mt-1">Margen: {margin.toFixed(1)}%</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total venta</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{formatCOP(sale.total)}</p>
          {sale.discount > 0 && (
            <p className="text-sm text-amber-600 mt-1">Descuento: {formatCOP(sale.discount)}</p>
          )}
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Método de pago</p>
          <p className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
            <CreditCard size={20} className="text-primary-600" />
            {sale.paymentMethod}
          </p>
          <p className="text-sm text-gray-400 mt-1">{sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-primary-600" />
            Datos del Cliente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Nombre</p>
                <p className="font-semibold text-gray-900">{sale.customer.name}</p>
              </div>
            </div>
            {sale.customer.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Phone size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Celular</p>
                  <p className="font-semibold text-gray-900">{sale.customer.phone}</p>
                </div>
              </div>
            )}
            {sale.customer.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Dirección</p>
                  <p className="font-semibold text-gray-900">{sale.customer.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Ciudad</p>
                <p className="font-semibold text-gray-900">{sale.customer.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary-600" />
            Productos
          </h2>
          <div className="space-y-3">
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
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
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{item.qty} × {formatCOP(item.price)}</p>
                  <p className="font-bold text-sm text-gray-900">{formatCOP(item.price * item.qty)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCOP(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Descuento</span>
                <span>- {formatCOP(sale.discount)}</span>
              </div>
            )}
            {sale.shippingCustomer > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Envío cobrado al cliente</span>
                <span>+ {formatCOP(sale.shippingCustomer)}</span>
              </div>
            )}
            {sale.shippingReal > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1"><Truck size={12}/>Costo real envío</span>
                <span>{formatCOP(sale.shippingReal)}</span>
              </div>
            )}
            {sale.shippingSubsidy > 0 && (
              <div className="flex justify-between text-sm text-orange-500">
                <span>Subsidio tienda</span>
                <span>- {formatCOP(sale.shippingSubsidy)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary-700">{formatCOP(sale.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
