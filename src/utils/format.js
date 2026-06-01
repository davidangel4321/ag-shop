/**
 * Format a number as Colombian Peso (COP)
 * Result: $ 1,234,567
 */
export function formatCOP(amount) {
  if (amount === null || amount === undefined) return '$ 0'
  return '$ ' + Math.round(amount).toLocaleString('es-CO')
}

/**
 * Format a date string as DD/MM/YYYY
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Format a date string as DD/MM/YYYY HH:mm
 */
export function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/**
 * Format date as YYYY-MM-DD for input[type=date]
 */
export function toInputDate(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}
