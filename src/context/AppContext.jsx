import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { getItem, setItem, removeItem, KEYS } from '../utils/storage'
import { getCollection, setDocument, updateDocument, deleteDocument, updateStockOnly, updateProductStock } from '../utils/firestore'

const DEFAULT_ADMIN = {
  id: 'user-1',
  username: 'admin',
  password: 'agshop2024',
  name: 'Administrador',
  role: 'admin',
  active: true,
  createdAt: new Date().toISOString(),
}

// ── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  currentUser: null,
  products: [],
  sales: [],
  users: [],
  agencies: [],
  selectedAgency: null,
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload }
    case 'LOGOUT':
      return { ...state, currentUser: null, selectedAgency: null }
    case 'LOAD_PRODUCTS':
      return { ...state, products: action.payload }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      }
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      }
    case 'LOAD_SALES':
      return { ...state, sales: action.payload }
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] }
    case 'DELETE_SALE':
      return { ...state, sales: state.sales.filter(s => s.id !== action.payload) }
    case 'LOAD_USERS':
      return { ...state, users: action.payload }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
      }
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) }
    case 'LOAD_AGENCIES':
      return { ...state, agencies: action.payload }
    case 'ADD_AGENCY':
      return { ...state, agencies: [...state.agencies, action.payload] }
    case 'UPDATE_AGENCY':
      return {
        ...state,
        agencies: state.agencies.map(a => a.id === action.payload.id ? action.payload : a),
      }
    case 'DELETE_AGENCY':
      return { ...state, agencies: state.agencies.filter(a => a.id !== action.payload) }
    case 'SET_SELECTED_AGENCY':
      return { ...state, selectedAgency: action.payload }
    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)

  // Bootstrap
  useEffect(() => {
    async function bootstrap() {
      try {
        // Restore auth session from localStorage
        const authData = getItem(KEYS.AUTH)
        if (authData && authData.exp > Date.now()) {
          dispatch({ type: 'SET_USER', payload: authData.user })
        } else if (authData) {
          removeItem(KEYS.AUTH)
        }

        // Restore selected agency
        const savedAgency = getItem(KEYS.SELECTED_AGENCY)
        if (savedAgency !== null) {
          dispatch({ type: 'SET_SELECTED_AGENCY', payload: savedAgency })
        }

        // Load agencies from Firestore
        const agencies = await getCollection('agencies')
        dispatch({ type: 'LOAD_AGENCIES', payload: agencies })

        // Load products from Firestore
        const products = await getCollection('products')
        dispatch({ type: 'LOAD_PRODUCTS', payload: products })

        // Load sales from Firestore
        const sales = await getCollection('sales')
        dispatch({ type: 'LOAD_SALES', payload: sales })

        // Load users from Firestore, seed default admin if empty
        let users = await getCollection('users')
        if (!users || users.length === 0) {
          await setDocument('users', DEFAULT_ADMIN.id, DEFAULT_ADMIN)
          users = [DEFAULT_ADMIN]
        }
        dispatch({ type: 'LOAD_USERS', payload: users })
      } catch (err) {
        console.error('Bootstrap error:', err)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────
  async function login(username, password) {
    let users = state.users
    if (!users || users.length === 0) {
      try {
        users = await getCollection('users')
        if (users && users.length > 0) {
          dispatch({ type: 'LOAD_USERS', payload: users })
        } else {
          await setDocument('users', DEFAULT_ADMIN.id, DEFAULT_ADMIN)
          users = [DEFAULT_ADMIN]
          dispatch({ type: 'LOAD_USERS', payload: users })
        }
      } catch {
        users = [DEFAULT_ADMIN]
      }
    }
    const found = users.find(
      u => u.username === username && u.password === password && u.active === true
    )
    if (found) {
      const user = {
        id: found.id,
        username: found.username,
        role: found.role,
        name: found.name,
        agencyId: found.agencyId || null,
      }
      const authData = {
        user,
        token: btoa(`${username}:${Date.now()}`),
        exp: Date.now() + 1000 * 60 * 60 * 8,
      }
      setItem(KEYS.AUTH, authData)
      dispatch({ type: 'SET_USER', payload: user })
      return true
    }
    return false
  }

  function setSelectedAgency(agencyId) {
    setItem(KEYS.SELECTED_AGENCY, agencyId)
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencyId })
  }

  async function addUser(userData) {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    await setDocument('users', newUser.id, newUser)
    dispatch({ type: 'ADD_USER', payload: newUser })
    return newUser
  }

  async function updateUser(user) {
    await updateDocument('users', user.id, user)
    dispatch({ type: 'UPDATE_USER', payload: user })
    if (state.currentUser && user.id === state.currentUser.id) {
      const refreshed = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        agencyId: user.agencyId || null,
      }
      const authData = getItem(KEYS.AUTH)
      if (authData) {
        setItem(KEYS.AUTH, { ...authData, user: refreshed })
      }
      dispatch({ type: 'SET_USER', payload: refreshed })
    }
  }

  async function deleteUser(id) {
    const admins = state.users.filter(u => u.role === 'admin' && u.active)
    const target = state.users.find(u => u.id === id)
    if (target?.role === 'admin' && admins.length <= 1) {
      return { error: 'No puedes eliminar el último administrador' }
    }
    await deleteDocument('users', id)
    dispatch({ type: 'DELETE_USER', payload: id })
    return { success: true }
  }

  async function changePassword(userId, newPassword) {
    const user = state.users.find(u => u.id === userId)
    if (!user) return
    await updateUser({ ...user, password: newPassword })
  }

  function logout() {
    removeItem(KEYS.AUTH)
    removeItem(KEYS.SELECTED_AGENCY)
    dispatch({ type: 'LOGOUT' })
  }

  async function addProduct(product) {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    await setDocument('products', newProduct.id, newProduct)
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct })
    return newProduct
  }

  async function updateProduct(product) {
    await updateDocument('products', product.id, product)
    dispatch({ type: 'UPDATE_PRODUCT', payload: product })
  }

  async function deleteProduct(id) {
    await deleteDocument('products', id)
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
  }

  async function addSale(saleData) {
    const maxNumber = state.sales.reduce((max, s) => Math.max(max, s.number || 0), 0)
    const number = maxNumber + 1
    const id = `SALE-${String(number).padStart(4, '0')}`
    const sale = {
      ...saleData,
      id,
      number,
      date: new Date().toISOString(),
    }

    // Reduce stock
    const updatedProducts = state.products.map(p => {
      const item = saleData.items.find(i => i.productId === p.id)
      if (!item) return p
      if (item.variantSize && p.variants && p.variants.length > 0) {
        const updatedVariants = p.variants.map(v =>
          v.size === item.variantSize ? { ...v, stock: Math.max(0, v.stock - item.qty) } : v
        )
        return { ...p, variants: updatedVariants, stock: updatedVariants.reduce((s, v) => s + v.stock, 0) }
      }
      return { ...p, stock: Math.max(0, p.stock - item.qty) }
    })

    // Update stock in Firestore
    await Promise.all(
      updatedProducts
        .filter(p => saleData.items.find(i => i.productId === p.id))
        .map(p => p.variants && p.variants.length > 0
          ? updateProductStock(p.id, { stock: p.stock, variants: p.variants })
          : updateStockOnly(p.id, p.stock)
        )
    )
    dispatch({ type: 'LOAD_PRODUCTS', payload: updatedProducts })

    // Save sale to Firestore
    await setDocument('sales', id, sale)
    dispatch({ type: 'ADD_SALE', payload: sale })

    return sale
  }

  async function deleteSale(id) {
    const sale = state.sales.find(s => s.id === id)

    if (sale) {
      const restoredProducts = state.products.map(p => {
        const item = sale.items.find(i => i.productId === p.id)
        if (!item) return p
        if (item.variantSize && p.variants && p.variants.length > 0) {
          const updatedVariants = p.variants.map(v =>
            v.size === item.variantSize ? { ...v, stock: v.stock + item.qty } : v
          )
          return { ...p, variants: updatedVariants, stock: updatedVariants.reduce((s, v) => s + v.stock, 0) }
        }
        return { ...p, stock: p.stock + item.qty }
      })

      await Promise.all(
        restoredProducts
          .filter(p => sale.items.find(i => i.productId === p.id))
          .map(p => p.variants && p.variants.length > 0
            ? updateProductStock(p.id, { stock: p.stock, variants: p.variants })
            : updateStockOnly(p.id, p.stock)
          )
      )
      dispatch({ type: 'LOAD_PRODUCTS', payload: restoredProducts })
    }

    await deleteDocument('sales', id)
    dispatch({ type: 'DELETE_SALE', payload: id })
  }

  async function addAgency(data) {
    const newAgency = {
      ...data,
      id: `agency-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    await setDocument('agencies', newAgency.id, newAgency)
    dispatch({ type: 'ADD_AGENCY', payload: newAgency })
    return newAgency
  }

  async function updateAgency(agency) {
    await updateDocument('agencies', agency.id, agency)
    dispatch({ type: 'UPDATE_AGENCY', payload: agency })
  }

  async function deleteAgency(id) {
    await deleteDocument('agencies', id)
    dispatch({ type: 'DELETE_AGENCY', payload: id })
  }

  // currentAgencyId: null = admin viendo todo, agencyId = filtro activo
  const currentAgencyId =
    state.currentUser?.role === 'admin'
      ? state.selectedAgency
      : (state.currentUser?.agencyId || null)

  const value = {
    ...state,
    loading,
    currentAgencyId,
    login,
    logout,
    setSelectedAgency,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    deleteSale,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    addAgency,
    updateAgency,
    deleteAgency,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
