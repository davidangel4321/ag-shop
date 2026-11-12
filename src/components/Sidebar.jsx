import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  LogOut,
  X,
  Users,
  Building2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const mainItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/sales/new', icon: ShoppingCart, label: 'Nueva Venta' },
  { to: '/sales', icon: History, label: 'Historial' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/agencies', icon: Building2, label: 'Agencias' },
]

function linkClass({ isActive }) {
  return `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-white text-primary-700 font-semibold shadow-lg shadow-black/20'
      : 'text-primary-200/80 hover:bg-white/5 hover:text-white'
  }`
}

function NavSection({ label, items, onClose }) {
  return (
    <div>
      <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-300/60">{label}</p>
      <div className="space-y-1">
        {items.map(({ to, icon: Icon, label: itemLabel }) => (
          <NavLink key={to} to={to} onClick={onClose} className={linkClass}>
            <Icon size={18} />
            {itemLabel}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const { logout, currentUser } = useApp()
  const isAdmin = currentUser?.role === 'admin'

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-gradient-to-b from-[#2D0808] via-[#3F0D0D] to-[#1F0505]
          shadow-2xl transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center p-1 shadow-inner">
              <img
                src="/logo.jpeg"
                alt="AG Shop"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-white font-black text-base tracking-tight">AG Shop</p>
              <p className="text-primary-300/70 text-[11px] font-medium">Punto de venta</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-primary-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          <NavSection label="Menú" items={mainItems} onClose={onClose} />
          {isAdmin && <NavSection label="Administración" items={adminItems} onClose={onClose} />}
        </nav>

        {/* User + logout */}
        <div className="m-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-primary-300/70 text-[11px] capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-primary-200 hover:bg-white/10 hover:text-white text-sm font-semibold transition-all"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
