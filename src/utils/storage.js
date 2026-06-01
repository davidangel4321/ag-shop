export const KEYS = {
  PRODUCTS: 'agshop_products',
  SALES: 'agshop_sales',
  AUTH: 'agshop_auth',
  USERS: 'agshop_users',
}

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage error', e)
  }
}

export function removeItem(key) {
  localStorage.removeItem(key)
}

export function seedIfEmpty() {}

export function clearSampleData() {
  const products = getItem(KEYS.PRODUCTS, [])
  const hasSample = products.some(p => ['prod-001', 'prod-002'].includes(p.id))
  if (hasSample) {
    localStorage.removeItem(KEYS.PRODUCTS)
    localStorage.removeItem(KEYS.SALES)
  }
}
