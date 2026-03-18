import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const ArrowLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

const Logo = () => (
  <span style={{ fontSize: 19, fontWeight: 800, color: '#6B46C1', letterSpacing: '-0.5px' }}>
    Provou<span style={{ color: '#4299E1' }}>Levou</span>
  </span>
)

export const Header = ({ title, showBack = false, onBack }) => {
  const { setMenuOpen } = useApp()
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header className="header">
      {showBack ? (
        <button className="header-btn" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft />
        </button>
      ) : (
        <button className="header-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <MenuIcon />
        </button>
      )}

      {title ? (
        <>
          <span className="header-title">{title}</span>
          <Logo />
        </>
      ) : (
        <Logo />
      )}

      {/* Spacer to keep logo centered when no back btn */}
      {!showBack && <div style={{ width: 38 }} />}
    </header>
  )
}

export default Header
