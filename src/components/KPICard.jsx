import React from 'react'

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'purple', trend }) {
  const colorMap = {
    purple: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mes anterior
        </div>
      )}
    </div>
  )
}
