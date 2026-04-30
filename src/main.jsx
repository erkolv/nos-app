import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import { TopBar, BottomNav } from './components/Layout'

import LoginPage      from './pages/LoginPage'
import HomePage       from './pages/HomePage'
import FinanceiroPage from './pages/FinanceiroPage'
import MaisPage       from './pages/MaisPage'
import { AgendaPage, ObjetivosPage } from './pages/OtherPages'

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F5F0' }}>
      <div style={{ fontSize:48, fontWeight:900, letterSpacing:'-3px', color:'#0E0E0C', lineHeight:1 }}>
        nós<span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#CEFF00', marginLeft:3, marginBottom:9 }} />
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/agenda"     element={<AgendaPage />} />
        <Route path="/objetivos"  element={<ObjetivosPage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
        <Route path="/mais"       element={<MaisPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
