// Cálculos financieros compartidos por Dashboard, Cierres y Comisiones.

export function saleCost(sale) {
  return sale.items.reduce((s, i) => s + i.cost * i.qty, 0)
}

// Base de la comisión: valor vendido de productos, sin domicilio ni costo de envío.
export function commissionBase(sale) {
  return Math.max(0, (sale.subtotal || 0) - (sale.discount || 0))
}

// Clave de mes en hora local: 'YYYY-MM'
export function monthKey(isoDate) {
  const d = new Date(isoDate)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Resumen de un período. month: 'YYYY-MM' o null (año completo con year). agencyId null = todo el negocio.
export function summarize({ sales, expenses = [], month = null, year = null, agencyId = null }) {
  const inPeriod = d => {
    const dt = new Date(d)
    if (month) return monthKey(d) === month
    if (year) return dt.getFullYear() === Number(year)
    return true
  }
  const salesP = sales.filter(s => inPeriod(s.date) && (!agencyId || s.agencyId === agencyId))
  const expP = expenses.filter(e => inPeriod(e.date) && (!agencyId || e.agencyId === agencyId))

  const revenue = salesP.reduce((s, x) => s + (x.total || 0), 0)
  const cost = salesP.reduce((s, x) => s + saleCost(x), 0)
  const shippingReal = salesP.reduce((s, x) => s + (x.shippingReal || 0), 0)
  const grossProfit = revenue - cost - shippingReal
  const expensesTotal = expP.reduce((s, e) => s + (e.amount || 0), 0)
  const commissions = salesP.reduce((s, x) => s + (x.commission || 0), 0)
  const netProfit = grossProfit - expensesTotal - commissions

  return {
    salesCount: salesP.length,
    revenue,
    cost,
    shippingReal,
    grossProfit,
    expenses: expensesTotal,
    commissions,
    netProfit,
    margin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
  }
}
