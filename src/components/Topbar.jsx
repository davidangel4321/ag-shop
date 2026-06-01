import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, AlertTriangle, PackageX } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Topbar({ onMenuClick }) {
  const { products, currentUser } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 5)
  const outOfStockItems = products.filter(p => p.stock === 0)
  const alerts = lowStockItems.length + outOfStockItems.length

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-gray-500 text-sm">
        <span className="text-primary-600 font-semibold">AG Shop</span>
        <span>/</span>
        <span>Panel de Control</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {alerts > 0 && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
            >
              <Bell size={20} />
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold pointer-events-none">
              {alerts}
            </span>

            {open && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">Alertas de inventario</p>
                  <span className="text-xs text-gray-400">{alerts} producto{alerts !== 1 ? 's' : ''}</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {outOfStockItems.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <PackageX size={15} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs font-mono text-gray-400">{p.sku}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg shrink-0">
                        Sin stock
                      </span>
                    </div>
                  ))}

                  {lowStockItems.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={15} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs font-mono text-gray-400">{p.sku}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                        {p.stock} unid.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700">
            {currentUser?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
