import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

const MOCK_CLIENTES = []

export default function Painel() {
  const { profile, showToast } = useApp()
  const [clientes, setClientes] = useState([])
  const [totalTrocas, setTotalTrocas] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile?.id || profile.id === 'mock-user-id') {
      setClientes(MOCK_CLIENTES)
      setTotalTrocas(0)
      setLoading(false)
      return
    }

    try {
      const [trocasRes, clientesRes] = await Promise.all([
        supabase.from('trocas').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('clientes').select('*').eq('user_id', profile.id).order('ultima_troca', { ascending: false }),
      ])

      setTotalTrocas(trocasRes.count || 0)
      setClientes(clientesRes.data || [])
    } catch (err) {
      console.warn('[Painel] Erro ao carregar:', err)
      setClientes([])
      setTotalTrocas(0)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (nome) => nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content fade-in">
        {/* Stats */}
        <div className="section">
          <div className="stats-grid">
            <div className="stat-card purple">
              <div className="stat-card-label">Total Provas</div>
              <div className="stat-card-value">
                {loading ? <span className="pulse">-</span> : totalTrocas}
              </div>
            </div>
            <div className="stat-card blue">
              <div className="stat-card-label">Clientes</div>
              <div className="stat-card-value">
                {loading ? <span className="pulse">-</span> : clientes.length}
              </div>
            </div>
          </div>
        </div>

        {/* Clientes list */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-title">
            👥 Clientes que Provaram
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>👕</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6 }}>
                Nenhum cliente ainda.
              </div>
              <div className="empty-state-text">
                Use o Provador Virtual para começar!
              </div>
            </div>
          ) : (
            <div>
              {clientes.map((cliente, i) => (
                <div key={cliente.id || i} className="client-item">
                  <div className="client-avatar">
                    {getInitials(cliente.nome)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                      {cliente.nome}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-dark)' }}>
                      {cliente.whatsapp}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 2 }}>
                      {formatDate(cliente.ultima_troca)}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      background: 'rgba(66,153,225,0.1)',
                      color: 'var(--secondary)',
                      borderRadius: 6, padding: '2px 8px',
                    }}>
                      {cliente.compras || 1} prova{(cliente.compras || 1) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick action */}
        <div className="section" style={{ paddingTop: 0 }}>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/provador'}
          >
            ✨ Novo Provador Virtual
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
