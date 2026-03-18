import React from 'react'

const QuanticLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="8.5" y="0" width="7" height="24" rx="3.5" fill="#A0AEC0" />
    <rect x="0" y="8.5" width="24" height="7" rx="3.5" fill="#A0AEC0" />
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
