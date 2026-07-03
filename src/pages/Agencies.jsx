import React, { useState } from 'react'
import { Building2, Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'

const EMPTY_FORM = { name: '', city: '' }

export default function AgenciesPage() {
  const { agencies, addAgency, updateAgency, deleteAgency } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingAgency, setEditingAgency] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function openAdd() {
    setEditingAgency(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(agency) {
    setEditingAgency(agency)
    setForm({ name: agency.name, city: agency.city })
    setShowModal(true)
  }

  async function handleDelete(agency) {
    if (!window.confirm(`¿Seguro que deseas eliminar la agencia "${agency.name}"?`)) return
    try {
      await deleteAgency(agency.id)
      toast.success('Agencia eliminada')
    } catch {
      toast.error('Error al eliminar agencia')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.city.trim()) {
      toast.error('Nombre y ciudad son obligatorios')
      return
    }
    try {
      if (editingAgency) {
        await updateAgency({ ...editingAgency, name: form.name.trim(), city: form.city.trim() })
        toast.success('Agencia actualizada')
      } else {
        await addAgency({ name: form.name.trim(), city: form.city.trim() })
        toast.success('Agencia creada')
      }
      setShowModal(false)
    } catch {
      toast.error('Error al guardar. Verifica la conexión con Firebase.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Agencias</h1>
          <p className="text-gray-500 text-sm mt-1">
            {agencies.length} agencia{agencies.length !== 1 ? 's' : ''} registrada{agencies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} />
          Nueva Agencia
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {agencies.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No hay agencias registradas</p>
            <p className="text-xs mt-1">Crea la primera agencia para comenzar</p>
            <button onClick={openAdd} className="btn-primary mx-auto mt-4">
              <Plus size={16} />
              Nueva Agencia
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-semibold">Agencia</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-semibold">Ciudad</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agencies.map(agency => (
                  <tr key={agency.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: '#8B1A1A' }}>
                          {agency.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{agency.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{agency.city}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(agency)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(agency)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 size={20} style={{ color: '#8B1A1A' }} />
                <h2 className="font-bold text-gray-900 text-lg">
                  {editingAgency ? 'Editar Agencia' : 'Nueva Agencia'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre de la agencia *</label>
                <input
                  className="input"
                  placeholder="Agencia Centro"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Ciudad *</label>
                <input
                  className="input"
                  placeholder="Bogotá"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingAgency ? 'Guardar cambios' : 'Crear agencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
