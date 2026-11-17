import React, { useMemo, useState } from 'react'
import { ShieldCheck, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDateTime } from '../utils/format'

const ENTITY_LABELS = {
  venta: 'Venta',
  producto: 'Producto',
  usuario: 'Usuario',
  agencia: 'Agencia',
  gasto: 'Gasto',
  'período': 'Cierre',
}

const ACTION_STYLE = {
  crear: 'bg-emerald-50 text-emerald-700',
  editar: 'bg-sky-50 text-sky-700',
  eliminar: 'bg-red-50 text-red-600',
  cerrar: 'bg-violet-50 text-violet-700',
}

export default function AuditLog() {
  const { audit } = useApp()
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('all')

  const entries = useMemo(() => {
    const q = search.trim().toLowerCase()
    return audit.filter(a =>
      (entity === 'all' || a.entity === entity) &&
      (!q || a.summary?.toLowerCase().includes(q) || a.userName?.toLowerCase().includes(q))
    )
  }, [audit, search, entity])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-500 mb-1">Seguridad</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Auditoría</h1>
        <p className="text-gray-500 text-sm mt-1">Quién creó, editó o eliminó cada registro. Muestra los últimos {audit.length} movimientos.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10 !py-2.5"
            placeholder="Buscar por descripción o usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-56" value={entity} onChange={e => setEntity(e.target.value)}>
          <option value="all">Todos los registros</option>
          {Object.entries(ENTITY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="card !p-0 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Sin movimientos</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {entries.map(a => (
              <li key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60">
                <span className={`mt-0.5 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-md shrink-0 ${ACTION_STYLE[a.action] || 'bg-gray-100 text-gray-600'}`}>
                  {a.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{a.summary}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.userName} · {ENTITY_LABELS[a.entity] || a.entity}
                  </p>
                </div>
                <time className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(a.date)}</time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
