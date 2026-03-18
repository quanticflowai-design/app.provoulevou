import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Menu from './components/Menu'
import Toast from './components/Toast'

// Pages
import Login from './pages/Login'
import Dados from './pages/Dados'
import Provador from './pages/Provador'
import Resultado from './pages/Resultado'
import Painel from './pages/Painel'
import Plano from './pages/Plano'

// Protected route wrapper
const Protected = ({ children }) => {
  const { user, loading } = useApp()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: 'var(--gray)' }}>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Menu />
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/provador" element={
          <Protected><Dados /></Protected>
        } />
        <Route path="/provador/fotos" element={
          <Protected><Provador /></Protected>
        } />
        <Route path="/provador/resultado" element={
          <Protected><Resultado /></Protected>
        } />
        <Route path="/painel" element={
          <Protected><Painel /></Protected>
        } />
        <Route path="/plano" element={
          <Protected><Plano /></Protected>
        } />
        <Route path="*" element={<Navigate to="/provador" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
