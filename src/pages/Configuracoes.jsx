import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)

const EyeIcon = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
)

// Toggle switch component
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48, height: 26,
      borderRadius: 13,
      border: 'none',
      cursor: 'pointer',
      padding: 3,
      background: value ? 'var(--primary)' : 'var(--gray-light)',
      transition: 'background 0.25s',
      display: 'flex',
      alignItems: 'center',
    }}
    aria-checked={value}
    role="switch"
  >
    <div style={{
      width: 20, height: 20, borderRadius: '50%', background: '#fff',
      transform: value ? 'translateX(22px)' : 'translateX(0)',
      transition: 'transform 0.25s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }} />
  </button>
)

// Inline section card
const Section = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 20px', marginBottom: 8 }}>
      {title}
    </div>
    <div style={{ background: 'var(--white)', borderTop: '1px solid var(--gray-light)', borderBottom: '1px solid var(--gray-light)' }}>
      {children}
    </div>
  </div>
)

const Row = ({ label, value, onPress, toggle, extra }) => (
  <div
    onClick={onPress}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid var(--gray-light)',
      cursor: onPress ? 'pointer' : 'default',
    }}
  >
    <span style={{ fontSize: 15, color: 'var(--text-dark)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {value && <span style={{ fontSize: 14, color: 'var(--gray-dark)' }}>{value}</span>}
      {extra}
      {toggle}
      {onPress && !toggle && <ChevronIcon />}
    </div>
  </div>
)

export default function Configuracoes() {
  const { profile, setProfile, showToast, darkMode, toggleDarkMode } = useApp()

  // Which panel is expanded
  const [panel, setPanel] = useState(null) // null | 'dados' | 'senha'

  // Edit dados state
  const [nome, setNome] = useState(profile?.nome || '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '')
  const [savingDados, setSavingDados] = useState(false)

  // Senha state
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState({ atual: false, nova: false, confirmar: false })
  const [savingSenha, setSavingSenha] = useState(false)

  const toggle = (key) => setPanel(p => p === key ? null : key)

  const getInitials = () => {
    const n = profile?.nome || profile?.email || 'U'
    return n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  const handleSalvarDados = async () => {
    if (!nome.trim()) { showToast('Nome obrigatório', 'error'); return }
    setSavingDados(true)
    try {
      if (profile?.id && profile.id !== 'mock-user-id') {
        const { error } = await supabase.from('users').update({ nome: nome.trim(), whatsapp }).eq('id', profile.id)
        if (error) throw error
      }
      setProfile(p => ({ ...p, nome: nome.trim(), whatsapp }))
      showToast('Dados atualizados!', 'success')
      setPanel(null)
    } catch {
      showToast('Erro ao salvar dados', 'error')
    } finally {
      setSavingDados(false)
    }
  }

  const handleAlterarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) { showToast('Senha deve ter no mínimo 6 caracteres', 'error'); return }
    if (novaSenha !== confirmarSenha) { showToast('Senhas não conferem', 'error'); return }
    setSavingSenha(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw error
      showToast('Senha alterada com sucesso!', 'success')
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
      setPanel(null)
    } catch {
      showToast('Erro ao alterar senha. Tente fazer login novamente.', 'error')
    } finally {
      setSavingSenha(false)
    }
  }

  const pwField = (placeholder, val, setVal, key) => (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input
        className="input"
        type={showSenha[key] ? 'text' : 'password'}
        placeholder={placeholder}
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShowSenha(s => ({ ...s, [key]: !s[key] }))}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', display: 'flex' }}
      >
        <EyeIcon open={showSenha[key]} />
      </button>
    </div>
  )

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Page title */}
        <div style={{ padding: '16px 20px 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>
          Configurações
        </div>

        {/* Profile card */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: 16,
            padding: '20px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 2 }}>
                {profile?.nome || 'Usuário'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email || ''}
              </div>
              {profile?.plano && (
                <div style={{
                  display: 'inline-block', marginTop: 6,
                  background: 'rgba(107,70,193,0.12)', color: 'var(--primary)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Plano {profile.plano}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editar Dados */}
        <Section title="Minha Conta">
          <Row label="Editar Dados" onPress={() => toggle('dados')} />
          {panel === 'dados' && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-light)', background: 'var(--bg)' }}>
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input className="input" type="text" placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">WhatsApp</label>
                <input className="input" type="tel" placeholder="(11) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handleSalvarDados} disabled={savingDados}>
                {savingDados ? <><span className="spinner" /> Salvando...</> : 'Salvar Dados'}
              </button>
            </div>
          )}

          <Row label="Alterar Senha" onPress={() => toggle('senha')} />
          {panel === 'senha' && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-light)', background: 'var(--bg)' }}>
              {pwField('Senha atual', senhaAtual, setSenhaAtual, 'atual')}
              {pwField('Nova senha', novaSenha, setNovaSenha, 'nova')}
              {pwField('Confirmar nova senha', confirmarSenha, setConfirmarSenha, 'confirmar')}
              <button className="btn btn-primary" onClick={handleAlterarSenha} disabled={savingSenha} style={{ marginTop: 4 }}>
                {savingSenha ? <><span className="spinner" /> Salvando...</> : 'Alterar Senha'}
              </button>
            </div>
          )}
        </Section>

        {/* Aparência */}
        <Section title="Aparência">
          <Row
            label={darkMode ? 'Modo Noturno' : 'Modo Claro'}
            extra={
              <span style={{ color: 'var(--gray-dark)', display: 'flex', alignItems: 'center' }}>
                {darkMode ? <MoonIcon /> : <SunIcon />}
              </span>
            }
            toggle={<Toggle value={darkMode} onChange={toggleDarkMode} />}
          />
        </Section>

        {/* Info */}
        <Section title="Sobre">
          <Row label="Versão" value="1.0.0" />
          <Row label="Provou Levou" value="provoulevou.com.br" />
        </Section>
      </div>

      <Footer />
    </div>
  )
}
