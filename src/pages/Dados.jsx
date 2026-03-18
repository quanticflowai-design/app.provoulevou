import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const formatWhatsApp = (value) => {
  const nums = value.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums ? `(${nums}` : ''
  if (nums.length <= 7) return `(${nums.slice(0,2)}) ${nums.slice(2)}`
  if (nums.length <= 11) return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7,11)}`
}

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function Dados() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', whatsapp: '', altura: '', peso: '' })
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Nome obrigatório'
    else if (form.nome.trim().length < 3) e.nome = 'Nome muito curto'

    const nums = form.whatsapp.replace(/\D/g, '')
    if (!nums) e.whatsapp = 'WhatsApp obrigatório'
    else if (nums.length < 10) e.whatsapp = 'WhatsApp inválido'

    const alt = parseInt(form.altura)
    if (!form.altura) e.altura = 'Obrigatório'
    else if (isNaN(alt) || alt < 140 || alt > 220) e.altura = '140–220 cm'

    const pes = parseInt(form.peso)
    if (!form.peso) e.peso = 'Obrigatório'
    else if (isNaN(pes) || pes < 30 || pes > 200) e.peso = '30–200 kg'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinuar = () => {
    if (!validate()) return
    navigate('/provador/fotos', { state: { dados: form } })
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content page-narrow">
        {/* Page title */}
        <div className="page-title" style={{ padding: '0 20px 4px', fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', textAlign: 'center' }}>
          Provador Virtual
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>

        {/* Form card */}
        <div className="desktop-card">
          <div className="section-title" style={{ justifyContent: 'center' }}>
            <UserIcon />
            Dados do seu Cliente
          </div>

          {/* Nome */}
          <div className="input-group">
            <label className="input-label">Nome</label>
            <input
              className={`input ${errors.nome ? 'error' : ''}`}
              type="text"
              placeholder="Nome completo do cliente"
              value={form.nome}
              onChange={e => update('nome', e.target.value)}
              autoComplete="name"
            />
            {errors.nome && <span className="input-error">{errors.nome}</span>}
          </div>

          {/* WhatsApp */}
          <div className="input-group">
            <label className="input-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.07h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.37a16 16 0 006.72 6.72l1.66-1.37a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                Whatsapp do seu cliente
              </span>
            </label>
            <input
              className={`input ${errors.whatsapp ? 'error' : ''}`}
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.whatsapp}
              onChange={e => update('whatsapp', formatWhatsApp(e.target.value))}
              autoComplete="tel"
            />
            {errors.whatsapp && <span className="input-error">{errors.whatsapp}</span>}
          </div>

          {/* Altura + Peso */}
          <div className="input-row">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Altura do cliente (cm)</label>
              <input
                className={`input ${errors.altura ? 'error' : ''}`}
                type="number"
                placeholder="175"
                value={form.altura}
                onChange={e => update('altura', e.target.value)}
                min="140" max="220"
                inputMode="numeric"
              />
              {errors.altura && <span className="input-error">{errors.altura}</span>}
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Peso do cliente (kg)</label>
              <input
                className={`input ${errors.peso ? 'error' : ''}`}
                type="number"
                placeholder="80"
                value={form.peso}
                onChange={e => update('peso', e.target.value)}
                min="30" max="200"
                inputMode="numeric"
              />
              {errors.peso && <span className="input-error">{errors.peso}</span>}
            </div>
          </div>

          {/* CTA */}
          <div style={{ paddingTop: 20 }}>
            <button className="btn btn-primary" onClick={handleContinuar}>
              Continuar
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
