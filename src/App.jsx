import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import NewSale from './pages/NewSale'
import SalesHistory from './pages/SalesHistory'
import SaleDetail from './pages/SaleDetail'
import Users from './pages/Users'

function PrivateRoute({ children }) {
  const { currentUser } = useApp()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { currentUser } = useApp()
  return currentUser ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  const { loading } = useApp()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
      <div className="text-center">
        <img src="/logo.jpeg" className="h-16 w-16 object-contain mx-auto mb-4 animate-pulse" />
        <p className="text-white text-sm">Cargando AG Shop...</p>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sales/new" element={<NewSale />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="sales/:id" element={<SaleDetail />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#7c3aed', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}
