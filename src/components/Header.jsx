import React from 'react'
import { useApp } from '../context/AppContext'
import { ProvouLevouLogo } from './Logo'

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

export const Header = () => {
  const { setMenuOpen } = useApp()

  return (
    <header className="header">
      <button className="header-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
        <MenuIcon />
      </button>

      <ProvouLevouLogo size="sm" id="header" />

      <div style={{ width: 38 }} />
    </header>
  )
}

export default Header
