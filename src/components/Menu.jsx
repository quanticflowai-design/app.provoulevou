import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ProvouLevouLogo } from './Logo'

const ShirtIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="3" width="4" height="18" rx="1" />
    <rect x="10" y="8" width="4" height="13" rx="1" />
    <rect x="2" y="13" width="4" height="8" rx="1" />
  </svg>
)

const CrownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M5 20V10l7-7 7 7v10" />
    <path d="M12 3v4M5 10l-3-2M19 10l3-2" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)

const ITEMS = [
  { path: '/provador', label: 'Provador Virtual', Icon: ShirtIcon, color: '#6B46C1', bg: 'rgba(107,70,193,0.1)' },
  { path: '/painel', label: 'Painel', Icon: BarChartIcon, color: '#4299E1', bg: 'rgba(66,153,225,0.1)' },
  { path: '/plano', label: 'Meu Plano', Icon: CrownIcon, color: '#ED8936', bg: 'rgba(237,137,54,0.1)' },
  { path: '/configuracoes', label: 'Configurações', Icon: SettingsIcon, color: '#718096', bg: 'rgba(113,128,150,0.1)' },
]

export const Menu = () => {
  const { menuOpen, setMenuOpen } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const close = () => setMenuOpen(false)

  const goto = (path) => {
    navigate(path)
    close()
  }

  return (
    <>
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={close} />
      <nav className={`menu-drawer ${menuOpen ? 'open' : ''}`} role="navigation">
        <div className="menu-header">
          <ProvouLevouLogo size="sm" id="menu" />
          <button className="menu-close" onClick={close} aria-label="Fechar menu">✕</button>
        </div>

        <div className="menu-items">
          {ITEMS.map(({ path, label, Icon, color, bg }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                className={`menu-item ${active ? 'active' : ''}`}
                onClick={() => goto(path)}
              >
                <span
                  className="menu-item-icon"
                  style={{ background: active ? bg : 'transparent', color: active ? color : 'var(--gray)' }}
                >
                  <Icon />
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ padding: '12px 0', borderTop: '1px solid var(--gray-light)' }}>
          <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={async () => {
            const { supabase: sb } = await import('../services/supabase')
            await sb.auth.signOut().catch(() => {})
            navigate('/login')
            close()
          }}>
            <span className="menu-item-icon" style={{ color: 'var(--danger)' }}>
              <LogOutIcon />
            </span>
            Sair
          </button>
        </div>
      </nav>
    </>
  )
}

export default Menu
