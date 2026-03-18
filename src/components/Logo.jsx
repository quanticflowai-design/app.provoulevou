import React from 'react'

// Shared ProvouLevou logo component
// size: 'sm' (header), 'md' (menu), 'lg' (login)
export const ProvouLevouLogo = ({ size = 'md', id = 'default' }) => {
  const cfg = {
    sm: { w: 44, h: 38, text: 18, gap: 8 },
    md: { w: 38, h: 32, text: 18, gap: 7 },
    lg: { w: 64, h: 54, text: 30, gap: 12 },
  }[size]

  const gid = `plg-${id}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: cfg.gap }}>
      <svg width={cfg.w} height={cfg.h} viewBox="0 0 48 44" fill="none">
        <defs>
          <linearGradient id={gid} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>
        </defs>
        {/* Hook - curls up and to the right */}
        <path
          d="M24 14 C24 8 27.5 4 30.5 3.5 C33.5 3 35.5 5 35.5 8 C35.5 10.5 33.5 12 30.5 12"
          stroke={`url(#${gid})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Body - shoulders with rounded bottom corners */}
        <path
          d="M24 14 L8 33 Q4.5 39 10 39 L38 39 Q43.5 39 40 33 L24 14"
          stroke={`url(#${gid})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
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
