import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import { supabase, PLANOS, getLimitePlano } from '../services/supabase'

const PLANO_LIST = [
  { key: 'starter', badge: 'ATIVO', badgeColor: '#48BB78' },
  { key: 'inicial' },
  { key: 'medio' },
  { key: 'premium' },
]

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function Plano() {
  const { profile, setProfile, showToast } = useApp()
  const [selectedPlan, setSelectedPlan] = useState(profile?.plano || 'starter')
  const [loading, setLoading] = useState(false)

  const currentPlan = profile?.plano || 'starter'
  const fotosUsadas = profile?.fotos_usadas || 0
  const limite = getLimitePlano(currentPlan)
  const progressPct = Math.min((fotosUsadas / limite) * 100, 100)

  const handleAtualizar = async () => {
    if (selectedPlan === currentPlan) {
      showToast('Você já está neste plano', 'warning')
      return
    }
    if (!profile?.id || profile.id === 'mock-user-id') {
      // Mock update
      setProfile(p => ({ ...p, plano: selectedPlan }))
      showToast(`Plano atualizado para ${PLANOS[selectedPlan].nome}!`, 'success')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ plano: selectedPlan })
        .eq('id', profile.id)
        .select()
        .single()
      if (error) throw error
      setProfile(data)
      showToast(`Plano atualizado para ${PLANOS[selectedPlan].nome}!`, 'success')
    } catch (err) {
      console.error('[Plano] Erro:', err)
      showToast('Erro ao atualizar plano', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content fade-in">
        {/* Plano atual */}
        <div className="section">
          <div className="card" style={{ background: 'linear-gradient(135deg, #2D3748, #4A5568)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Plano Atual
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              {PLANOS[currentPlan]?.nome}
            </div>
            <div style={{ fontSize: 14, color: '#A0AEC0', marginBottom: 12 }}>
              {fotosUsadas} / {limite} fotos utilizadas
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 90 ? 'linear-gradient(90deg, #E53E3E, #FC8181)' : undefined,
                }}
              />
            </div>
          </div>
        </div>

        {/* Planos disponíveis */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-title">
            👑 Planos Disponíveis
          </div>

          {PLANO_LIST.map(({ key }) => {
            const plano = PLANOS[key]
            const isCurrentPlan = key === currentPlan
            const isSelected = key === selectedPlan

            return (
              <div
                key={key}
                className={`plan-card ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedPlan(key)}
                style={{
                  position: 'relative',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--gray-light)',
                  boxShadow: isSelected ? '0 0 0 2px rgba(107,70,193,0.2)' : undefined,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="plan-card-name">{plano.nome}</span>
                    {isCurrentPlan && (
                      <span className="badge badge-success">ATIVO</span>
                    )}
                  </div>
                  <span className="plan-card-limit">{plano.limite} fotos/mês</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="plan-card-price">
                    <div className="plan-card-price-value">R$ {plano.preco}</div>
                    <div className="plan-card-price-period">/mês</div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                    }}>
                      <CheckIcon />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="section" style={{ paddingTop: 0 }}>
          <button
            className="btn btn-secondary"
            onClick={handleAtualizar}
            disabled={loading || selectedPlan === currentPlan}
          >
            {loading
              ? <><span className="spinner" /> Atualizando...</>
              : selectedPlan === currentPlan
                ? '✓ Plano Atual'
                : `Atualizar para ${PLANOS[selectedPlan]?.nome}`
            }
          </button>

          <p style={{
            textAlign: 'center', fontSize: 12, color: 'var(--gray)',
            marginTop: 12, lineHeight: 1.5,
          }}>
            Para pagamentos, entre em contato com<br />
            <strong style={{ color: 'var(--primary)' }}>suporte@provoulevou.com.br</strong>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
