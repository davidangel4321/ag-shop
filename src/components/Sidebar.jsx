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
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/sales/new', icon: ShoppingCart, label: 'Nueva Venta' },
  { to: '/sales', icon: History, label: 'Historial' },
]

export default function Sidebar({ open, onClose }) {
  const { logout, currentUser } = useApp()

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-primary-700 to-primary-900
          z-30 flex flex-col shadow-2xl transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-600">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="AG Shop"
              className="h-10 w-10 object-contain"
              onError={(e) => { e.target.style.display='none'; }}
            />
            <span className="text-white font-bold text-lg">AG Shop</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          {currentUser?.role === 'admin' && (
            <NavLink
              to="/users"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Users size={20} />
              Usuarios
            </NavLink>
          )}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-primary-600">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{currentUser?.name}</p>
              <p className="text-primary-300 text-xs capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-primary-200 hover:bg-white/10 hover:text-white text-sm font-semibold transition-all"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
