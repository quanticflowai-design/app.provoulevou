import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function Painel() {
  const navigate = useNavigate()
  const { profile, showToast } = useApp()
  const [trocas, setTrocas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  // Stats calculados
  const totalProvas = trocas.length
  const clientesUnicos = new Set(trocas.map(t => t.whatsapp)).size
  const compras = clientes.filter(c => (c.compras || 0) > 0)
  const totalCompras = compras.length
  const faturamento = trocas.reduce((acc, t) => acc + (t.valor || 0), 0)
  const taxaConversao = clientesUnicos > 0 ? ((totalCompras / clientesUnicos) * 100).toFixed(1) : '0.0'

  useEffect(() => {
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile?.id || profile.id === 'mock-user-id') {
      setTrocas([])
      setClientes([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [trocasRes, clientesRes] = await Promise.all([
        supabase.from('trocas').select('*').eq('user_id', profile.id).order('data', { ascending: false }),
        supabase.from('clientes').select('*').eq('user_id', profile.id).order('ultima_troca', { ascending: false }),
      ])

      setTrocas(trocasRes.data || [])
      setClientes(clientesRes.data || [])
    } catch (err) {
      console.warn('[Painel] Erro ao carregar:', err)
      setTrocas([])
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Merge trocas com info de clientes para a tabela
  const trocasComCliente = trocas.map(troca => {
    const cliente = clientes.find(c => c.whatsapp === troca.whatsapp)
    return { ...troca, comprou: (cliente?.compras || 0) > 0 }
  })

  const trocasFiltradas = filtro === 'comprou'
    ? trocasComCliente.filter(t => t.comprou)
    : filtro === 'nao_comprou'
      ? trocasComCliente.filter(t => !t.comprou)
      : trocasComCliente

  const handleWhatsApp = (whatsapp, nome) => {
    const numero = whatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${nome}! Tudo bem? 😊`)
    window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content painel-wide fade-in">
        {/* Page title */}
        <div style={{ paddingBottom: 8 }}>
          <h1 className="page-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)' }}>
            Estatísticas do Provador
          </h1>
        </div>

        {/* Stats cards - 4 cards */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="painel-stats-grid">
            {/* Total Provas */}
            <div className="painel-stat-card">
              <div className="painel-stat-icon" style={{ background: 'rgba(107,70,193,0.15)', color: '#6B46C1' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="painel-stat-label">TOTAL DE PROVAS VIRTUAIS</div>
              <div className="painel-stat-value">
                {loading ? <span className="pulse">-</span> : totalProvas}
              </div>
              <div className="painel-stat-sub">{clientesUnicos} clientes únicos</div>
            </div>

            {/* Compras */}
            <div className="painel-stat-card">
              <div className="painel-stat-icon" style={{ background: 'rgba(72,187,120,0.15)', color: '#48BB78' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </div>
              <div className="painel-stat-label">COMPRAS VIA PROVADOR</div>
              <div className="painel-stat-value">
                {loading ? <span className="pulse">-</span> : totalCompras}
              </div>
            </div>

            {/* Faturamento */}
            <div className="painel-stat-card">
              <div className="painel-stat-icon" style={{ background: 'rgba(72,187,120,0.15)', color: '#48BB78' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div className="painel-stat-label">FATURAMENTO (VIA PROVADOR)</div>
              <div className="painel-stat-value" style={{ fontSize: 26 }}>
                {loading ? <span className="pulse">-</span> : formatCurrency(faturamento)}
              </div>
            </div>

            {/* Taxa de Conversão */}
            <div className="painel-stat-card">
              <div className="painel-stat-icon" style={{ background: 'rgba(107,70,193,0.15)', color: '#6B46C1' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="painel-stat-label">TAXA DE CONVERSÃO</div>
              <div className="painel-stat-value" style={{ color: '#48BB78' }}>
                {loading ? <span className="pulse">-</span> : `${taxaConversao}%`}
              </div>
              <div className="painel-stat-sub">clientes únicos → compradores</div>
            </div>
          </div>
        </div>

        {/* Tabela de clientes */}
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="painel-table-container">
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Últimos Clientes
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className="painel-filter-select"
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="comprou">Apenas quem Comprou</option>
                  <option value="nao_comprou">Não Compraram</option>
                </select>
                <button className="painel-refresh-btn" onClick={loadData} disabled={loading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <span className="spinner spinner-dark" />
              </div>
            ) : trocasFiltradas.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👕</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6 }}>
                  Nenhum cliente ainda.
                </div>
                <div className="empty-state-text">
                  Use o Provador Virtual para começar!
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="painel-table-desktop">
                  <table className="painel-table">
                    <thead>
                      <tr>
                        <th>DATA E HORA</th>
                        <th>CLIENTE</th>
                        <th>WHATSAPP</th>
                        <th>PRODUTO</th>
                        <th>COMPROU?</th>
                        <th>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trocasFiltradas.map((troca, i) => (
                        <tr key={troca.id || i}>
                          <td>{formatDate(troca.data)}</td>
                          <td style={{ fontWeight: 600 }}>{troca.nome}</td>
                          <td>{troca.whatsapp}</td>
                          <td>{troca.produto || troca.tamanho || '-'}</td>
                          <td>
                            <span className={`painel-badge ${troca.comprou ? 'success' : 'pending'}`}>
                              {troca.comprou ? '✅ Comprou' : '⏳ Pendente'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="painel-whatsapp-btn"
                              onClick={() => handleWhatsApp(troca.whatsapp, troca.nome)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.767-6.264-2.065l-.438-.335-2.645.887.887-2.645-.335-.438A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                              Chamar no Whats
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="painel-table-mobile">
                  {trocasFiltradas.map((troca, i) => (
                    <div key={troca.id || i} className="painel-mobile-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>{troca.nome}</span>
                        <span className={`painel-badge ${troca.comprou ? 'success' : 'pending'}`}>
                          {troca.comprou ? '✅ Comprou' : '⏳ Pendente'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>
                        📞 {troca.whatsapp}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>
                        📦 {troca.produto || troca.tamanho || '-'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 10 }}>
                        📅 {formatDate(troca.data)}
                      </div>
                      <button
                        className="painel-whatsapp-btn"
                        style={{ width: '100%' }}
                        onClick={() => handleWhatsApp(troca.whatsapp, troca.nome)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.767-6.264-2.065l-.438-.335-2.645.887.887-2.645-.335-.438A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                        Chamar no Whats
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
