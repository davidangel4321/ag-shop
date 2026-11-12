import React from 'react'

const COLORS = {
  purple: { accent: 'from-primary-500 to-primary-700', icon: 'bg-primary-50 text-primary-600' },
  amber: { accent: 'from-amber-400 to-amber-600', icon: 'bg-amber-50 text-amber-600' },
  green: { accent: 'from-emerald-400 to-emerald-600', icon: 'bg-emerald-50 text-emerald-600' },
  blue: { accent: 'from-sky-400 to-sky-600', icon: 'bg-sky-50 text-sky-600' },
  red: { accent: 'from-red-400 to-red-600', icon: 'bg-red-50 text-red-600' },
}

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'purple', trend }) {
  const palette = COLORS[color] || COLORS.purple

  return (
    <div className="relative overflow-hidden card !p-5 flex flex-col gap-3">
      {/* Accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.accent}`} />

      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${palette.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {trend !== undefined && (
        <div className={`text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mes anterior
        </div>
      )}
    </div>
  )
}
