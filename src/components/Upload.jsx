import React, { useRef } from 'react'

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)

export const Upload = ({
  label,
  sublabel,
  preview,
  onChange,
  onRemove,
  height = 160,
  accept = 'image/*',
}) => {
  const inputRef = useRef(null)

  const handleClick = () => {
    if (!preview) inputRef.current?.click()
  }

  return (
    <div>
      {label && (
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--gray-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {label}
        </div>
      )}
      <div
        className={`upload-area ${preview ? 'has-image' : ''}`}
        style={{ height, cursor: preview ? 'default' : 'pointer', position: 'relative' }}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.() }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <>
            <div className="upload-icon">
              <PlusIcon />
            </div>
            <div className="upload-text">
              <strong>{sublabel || 'Enviar foto'}</strong>
              <span>Toque para selecionar</span>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange?.(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default Upload
