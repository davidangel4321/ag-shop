import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'

// Páginas pesadas (gráficos, PDF) se cargan solo cuando se visitan
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Inventory = lazy(() => import('./pages/Inventory'))
const NewSale = lazy(() => import('./pages/NewSale'))
const SalesHistory = lazy(() => import('./pages/SalesHistory'))
const SaleDetail = lazy(() => import('./pages/SaleDetail'))
const Users = lazy(() => import('./pages/Users'))
const Agencies = lazy(() => import('./pages/Agencies'))

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
      <div className="text-center">
        <img src="/logo.jpeg" alt="" className="h-16 w-16 object-contain mx-auto mb-4 animate-pulse" />
        <p className="text-white text-sm">Cargando AG Shop...</p>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { currentUser, loading } = useApp()
  if (loading) return <Splash />
  return currentUser ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { currentUser, loading } = useApp()
  if (loading) return <Splash />
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { currentUser } = useApp()
  return currentUser ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Suspense fallback={<Splash />}>
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
        <Route
          path="agencies"
          element={
            <AdminRoute>
              <Agencies />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
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
