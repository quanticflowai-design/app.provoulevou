import React from 'react'

// Shared ProvouLevou logo component
// size: 'sm' (header), 'md' (menu), 'lg' (login)
export const ProvouLevouLogo = ({ size = 'md', id = 'default' }) => {
  const cfg = {
    sm: { w: 30, h: 22, text: 15 },
    md: { w: 38, h: 28, text: 18 },
    lg: { w: 60, h: 44, text: 28 },
  }[size]

  const gid = `plg-${id}`

  // Single path per hanger: hook arc + body V-shape (stroke only)
  const hangerPath = 'M15 8 C15 5.5 16.5 4 18 3.5 C19.5 3 21 4 21 5.8 C21 7 20.5 8 15 8 C13 9 1 16 0 28 L34 28 C33 16 17 9 15 8'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? 10 : 6 }}>
      <svg width={cfg.w} height={cfg.h} viewBox="0 0 50 32" fill="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>
        </defs>
        {/* Hanger */}
        <path
          d={hangerPath}
          stroke={`url(#${gid})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(8, 1)"
        />
      </svg>

      <span style={{ fontWeight: 800, fontSize: cfg.text, letterSpacing: '-0.5px', lineHeight: 1 }}>
        <span style={{ color: 'var(--logo-dark, #0D0D1A)' }}>Provou</span>
        <span style={{
          background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Levou</span>
      </span>
    </div>
  )
}

export default ProvouLevouLogo
