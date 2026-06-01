import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, User, ShoppingBag } from 'lucide-react'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = await login(form.username, form.password)
    if (ok) {
      toast.success('¡Bienvenido a AG Shop!')
      navigate('/dashboard')
    } else {
      toast.error('Credenciales incorrectas')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.jpeg"
              alt="AG Shop"
              className="h-20 w-20 object-contain mb-4"
              onError={(e) => { e.target.style.display='none'; }}
            />
            <h1 className="text-2xl font-black text-gray-900">AG Shop</h1>
            <p className="text-gray-500 text-sm mt-1">POS & Gestión de Inventario</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="label">Usuario</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  className="input pl-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base rounded-xl mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Ingresar
                </>
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          © 2024 AG Shop. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
