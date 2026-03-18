import React from 'react'

const LOGO_URL = 'https://i.ibb.co/xqP7Kg5f/logo-provou-levou-sem-fundo.png'

// size: 'sm' (header/menu), 'lg' (login)
export const ProvouLevouLogo = ({ size = 'sm' }) => {
  const height = size === 'lg' ? 52 : 32
  return (
    <img
      src={LOGO_URL}
      alt="Provou Levou"
      style={{ height, width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  )
}

export default ProvouLevouLogo
