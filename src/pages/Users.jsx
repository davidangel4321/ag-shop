import React, { useState } from 'react'
import { Users, Plus, Edit2, Trash2, Eye, EyeOff, Shield, UserCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'

const EMPTY_FORM = {
  name: '',
  username: '',
  password: '',
  role: 'vendedor',
  active: true,
}

export default function UsersPage() {
  const { users, currentUser, addUser, updateUser, deleteUser, changePassword } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [pwSection, setPwSection] = useState({ newPassword: '', confirmPassword: '', show: false })

  function openAdd() {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setShowPassword(false)
    setPwSection({ newPassword: '', confirmPassword: '', show: false })
    setShowModal(true)
  }

  function openEdit(user) {
    setEditingUser(user)
    setForm({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      active: user.active,
    })
    setShowPassword(false)
    setPwSection({ newPassword: '', confirmPassword: '', show: false })
    setShowModal(true)
  }

  async function handleDelete(user) {
    if (user.id === currentUser.id) {
      toast.error('No puedes eliminar tu propio usuario')
      return
    }
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${user.name}"?`)) return
    try {
      const result = await deleteUser(user.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario eliminado')
      }
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.username.trim()) {
      toast.error('Nombre y usuario son obligatorios')
      return
    }
    if (!editingUser && !form.password) {
      toast.error('La contraseña es obligatoria')
      return
    }
    const duplicate = users.find(
      u => u.username === form.username.trim() && u.id !== editingUser?.id
    )
    if (duplicate) {
      toast.error('Ya existe un usuario con ese nombre de usuario')
      return
    }
    try {
      if (editingUser) {
        await updateUser({ ...editingUser, ...form, username: form.username.trim(), name: form.name.trim() })
        toast.success('Usuario actualizado')
      } else {
        await addUser({ ...form, username: form.username.trim(), name: form.name.trim() })
        toast.success('Usuario creado')
      }
      setShowModal(false)
    } catch {
      toast.error('Error al guardar. Verifica la conexión con Firebase.')
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!pwSection.newPassword) {
      toast.error('Ingresa la nueva contraseña')
      return
    }
    if (pwSection.newPassword !== pwSection.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    try {
      await changePassword(editingUser.id, pwSection.newPassword)
      toast.success('Contraseña actualizada')
      setPwSection({ newPassword: '', confirmPassword: '', show: false })
    } catch {
      toast.error('Error al actualizar contraseña')
    }
  }

  const adminCount = users.filter(u => u.role === 'admin' && u.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Nombre</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Usuario</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Rol</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Estado</th>
                <th className="text-right px-6 py-3 text-gray-500 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => {
                const isLastAdmin = user.role === 'admin' && adminCount <= 1
                const isSelf = user.id === currentUser.id
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: user.role === 'admin' ? '#8B1A1A' : '#2563eb' }}
                        >
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {user.name}
                          {isSelf && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{user.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                        style={
                          user.role === 'admin'
                            ? { background: '#fef2f2', color: '#8B1A1A' }
                            : { background: '#eff6ff', color: '#1d4ed8' }
                        }
                      >
                        {user.role === 'admin' ? <Shield size={11} /> : <UserCheck size={11} />}
                        {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                          user.active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isLastAdmin || isSelf}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isLastAdmin ? 'No puedes eliminar el último admin' : isSelf ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users size={20} style={{ color: '#8B1A1A' }} />
                <h2 className="font-bold text-gray-900 text-lg">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input
                  className="input"
                  placeholder="Juan Pérez"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Usuario *</label>
                <input
                  className="input"
                  placeholder="juanperez"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="label">Contraseña *</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Rol</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Activo</p>
                  <p className="text-xs text-gray-500">El usuario puede iniciar sesión</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingUser ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>

            {/* Change password section — only in edit mode */}
            {editingUser && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Cambiar contraseña</h3>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="label">Nueva contraseña</label>
                      <div className="relative">
                        <input
                          className="input pr-10"
                          type={pwSection.show ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={pwSection.newPassword}
                          onChange={e => setPwSection(s => ({ ...s, newPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setPwSection(s => ({ ...s, show: !s.show }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {pwSection.show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirmar contraseña</label>
                      <input
                        className="input"
                        type={pwSection.show ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={pwSection.confirmPassword}
                        onChange={e => setPwSection(s => ({ ...s, confirmPassword: e.target.value }))}
                      />
                      {pwSection.confirmPassword && pwSection.newPassword !== pwSection.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                      )}
                    </div>
                    <button type="submit" className="w-full btn-secondary justify-center">
                      Actualizar contraseña
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
