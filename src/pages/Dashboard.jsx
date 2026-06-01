import React, { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  DollarSign, TrendingUp, ShoppingBag, Package, BarChart2
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import KPICard from '../components/KPICard'
import SaleRow from '../components/SaleRow'
import { formatCOP, formatDate } from '../utils/format'

function copFormatter(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v}`
}

export default function Dashboard() {
  const { sales, products } = useApp()

  const {
    totalRevenue, totalCost, grossProfit, profitMargin,
    inventoryValue, dailyData, topProducts, recentSales
  } = useMemo(() => {
    const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0)
    const totalCost = sales.reduce((s, sale) =>
      s + sale.items.reduce((ss, i) => ss + i.cost * i.qty, 0), 0)
    const grossProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const inventoryValue = products.reduce((s, p) => s + p.costPrice * p.stock, 0)

    // Daily data - last 30 days
    const now = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      days.push({ date: key, label: `${d.getDate()}/${d.getMonth() + 1}` })
    }
    const dailyMap = {}
    sales.forEach(sale => {
      const key = sale.date.split('T')[0]
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, profit: 0 }
      const cost = sale.items.reduce((s, i) => s + i.cost * i.qty, 0)
      dailyMap[key].revenue += sale.total
      dailyMap[key].profit += sale.total - cost
    })
    const dailyData = days.map(d => ({
      label: d.label,
      Ventas: dailyMap[d.date]?.revenue || 0,
      Ganancia: dailyMap[d.date]?.profit || 0,
    }))

    // Top products
    const productSales = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 }
        }
        productSales[item.productId].qty += item.qty
        productSales[item.productId].revenue += item.price * item.qty
      })
    })
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({ name: p.name.substring(0, 16), Ingresos: p.revenue, Unidades: p.qty }))

    const recentSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

    return { totalRevenue, totalCost, grossProfit, profitMargin, inventoryValue, dailyData, topProducts, recentSales }
  }, [sales, products])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general de tu negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Ingresos Totales"
          value={formatCOP(totalRevenue)}
          subtitle={`${sales.length} ventas`}
          icon={DollarSign}
          color="purple"
        />
        <KPICard
          title="Costo Total"
          value={formatCOP(totalCost)}
          subtitle="Costo de productos vendidos"
          icon={ShoppingBag}
          color="blue"
        />
        <KPICard
          title="Ganancia Bruta"
          value={formatCOP(grossProfit)}
          subtitle="Ingresos menos costos"
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Margen de Ganancia"
          value={`${profitMargin.toFixed(1)}%`}
          subtitle="Rentabilidad sobre ventas"
          icon={BarChart2}
          color="amber"
        />
      </div>

      {/* Inventory Value */}
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
          <Package size={24} className="text-primary-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor del Inventario</p>
          <p className="text-xl font-black text-gray-900">{formatCOP(inventoryValue)}</p>
          <p className="text-xs text-gray-400">{products.length} productos • {products.reduce((s,p)=>s+p.stock,0)} unidades totales</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card xl:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4">Ventas últimos 30 días</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval={4}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={copFormatter}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value) => [formatCOP(value)]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="Ventas" stroke="#8B1A1A" strokeWidth={2} fill="url(#colorVentas)" />
              <Area type="monotone" dataKey="Ganancia" stroke="#f59e0b" strokeWidth={2} fill="url(#colorGanancia)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - top products */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Top Productos</h2>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sin ventas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={copFormatter}
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [name === 'Ingresos' ? formatCOP(value) : value, name]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Ingresos" fill="#8B1A1A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Ventas Recientes</h2>
        {recentSales.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No hay ventas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</th>
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total</th>
                  <th className="pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <SaleRow key={sale.id} sale={sale} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
