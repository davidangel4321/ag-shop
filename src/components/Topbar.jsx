import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, AlertTriangle, PackageX, Building2, ChevronDown, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Topbar({ onMenuClick }) {
  const { products, currentUser, agencies, selectedAgency, setSelectedAgency } = useApp()
  const [open, setOpen] = useState(false)
  const [agencyOpen, setAgencyOpen] = useState(false)
  const ref = useRef(null)
  const agencyRef = useRef(null)

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 5)
  const outOfStockItems = products.filter(p => p.stock === 0)
  const alerts = lowStockItems.length + outOfStockItems.length

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
      if (agencyRef.current && !agencyRef.current.contains(e.target)) setAgencyOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A'

  const selectedAgencyName = selectedAgency
    ? agencies.find(a => a.id === selectedAgency)?.name || 'Agencia'
    : 'Todo el negocio'

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/70 flex items-center justify-between px-4 lg:px-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="font-black text-primary-700 tracking-tight">AG Shop</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 font-medium">Panel de Control</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Agency selector — admin only */}
        {currentUser?.role === 'admin' && agencies.length > 0 && (
          <div className="relative" ref={agencyRef}>
            <button
              onClick={() => setAgencyOpen(v => !v)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-gray-100/80 hover:bg-gray-100 ring-1 ring-gray-200 text-gray-800 text-sm font-semibold transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${selectedAgency ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline max-w-[150px] truncate">{selectedAgencyName}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${agencyOpen ? 'rotate-180' : ''}`} />
            </button>

            {agencyOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Vista de agencia</p>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  <button
                    onClick={() => { setSelectedAgency(null); setAgencyOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors hover:bg-gray-50 ${
                      !selectedAgency ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-white shrink-0">
                      <Building2 size={15} />
                    </div>
                    <span className="flex-1">Todo el negocio</span>
                    {!selectedAgency && <Check size={16} className="text-primary-600" />}
                  </button>
                  {agencies.map(agency => (
                    <button
                      key={agency.id}
                      onClick={() => { setSelectedAgency(agency.id); setAgencyOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors hover:bg-gray-50 ${
                        selectedAgency === agency.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold shrink-0">
                        {agency.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{agency.name}</p>
                        <p className="text-xs text-gray-400">{agency.city}</p>
                      </div>
                      {selectedAgency === agency.id && <Check size={16} className="text-primary-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {alerts > 0 && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              className="relative p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 ring-1 ring-amber-200/60 transition-colors"
              aria-label="Alertas de inventario"
            >
              <Bell size={18} />
            </button>
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] rounded-full flex items-center justify-center font-bold ring-2 ring-white pointer-events-none">
              {alerts}
            </span>

            {open && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">Alertas de inventario</p>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {alerts} producto{alerts !== 1 ? 's' : ''}
                  </span>
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
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg shrink-0">
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
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                        {p.stock} unid.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User chip */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 ml-1 sm:border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary-700/25 ring-2 ring-white">
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-gray-400 capitalize">{currentUser?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
