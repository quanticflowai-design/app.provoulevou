import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'

export default function Resultado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  const { resultado, tamanho, dados } = location.state || {}
  const [imgLoaded, setImgLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!resultado && !tamanho) {
    return (
      <div className="app-container">
        <Header />
        <div className="page-content">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-text">Nenhum resultado disponível.<br />Tente novamente.</div>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/provador')}>
              Voltar ao Provador
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSalvar = async () => {
    setSaving(true)
    try {
      if (navigator.share && resultado) {
        await navigator.share({
          title: 'Meu Resultado - Provou Levou',
          text: `Tamanho ideal: ${tamanho} — Provou Levou`,
          url: resultado,
        })
      } else {
        await navigator.clipboard.writeText(resultado)
        showToast('Link copiado!', 'success')
      }
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content fade-in">
        {/* Step indicator */}
        <div className="step-indicator">
          <div className="step-dot" />
          <div className="step-dot" />
          <div className="step-dot active" />
        </div>

        {/* Desktop: horizontal layout / Mobile: vertical */}
        <div className="resultado-grid">
          {/* Image column */}
          <div className="resultado-col-image">
            {resultado && (
              <div className="result-image-container" style={{ minHeight: imgLoaded ? 'auto' : 300 }}>
                {!imgLoaded && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--gray-light)',
                  }}>
                    <span className="spinner spinner-dark" />
                  </div>
                )}
                <img
                  src={resultado}
                  alt="Resultado do provador virtual"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                  style={{ width: '100%', display: 'block', opacity: imgLoaded ? 1 : 0 }}
                />
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="resultado-col-info">
            {/* Success header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(72,187,120,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: 24,
              }}>
                ✅
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>
                Resultado Gerado!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginTop: 4 }}>
                Seu look virtual está pronto
              </p>
            </div>

            {/* Size badge */}
            <div className="section" style={{ padding: 0 }}>
              <div className="result-size-badge">
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, opacity: 0.9, marginBottom: 6 }}>
                  TAMANHO IDEAL
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>
                  {tamanho || 'M/G'}
                </div>
                {dados && (
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                    Baseado em {dados.altura}cm / {dados.peso}kg
                  </div>
                )}
              </div>
            </div>

            {/* Client info */}
            {dados && (
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-dark)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                  Cliente
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>{dados.nome}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-dark)', marginTop: 2 }}>{dados.whatsapp}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleSalvar} disabled={saving}>
                {saving ? <><span className="spinner" /> Salvando...</> : 'Salvar Resultado'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/provador')}
              >
                Nova Tentativa
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
