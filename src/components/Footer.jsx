import React from 'react'

const QuanticLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#A0AEC0" strokeWidth="2" />
    <path d="M8 12h8M12 8v8" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const Footer = () => (
  <footer className="footer">
    <span>powered by</span>
    <QuanticLogo />
    <strong style={{ color: '#718096', fontWeight: 600 }}>quantic</strong>
  </footer>
)

export default Footer
