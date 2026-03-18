import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Upload from '../components/Upload'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import { fileToBase64, enviarParaWebhook, mockWebhook, DEFAULT_WEBHOOK } from '../services/n8n'
import { supabase, getLimitePlano } from '../services/supabase'

const WARNING_COSTAS = 'Se escolheu costas, envie sua foto de costas. Se frente, envie de frente.'

export default function Provador() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast, profile, setProfile, canUseProvador, fotosRestantes } = useApp()

  const dados = location.state?.dados

  // Se veio direto sem dados, redireciona para cadastro
  useEffect(() => {
    if (!dados) navigate('/provador')
  }, [dados, navigate])

  const [fotoProduto, setFotoProduto] = useState(null)
  const [fotoProdutoPreview, setFotoProdutoPreview] = useState(null)
  const [fotoCliente, setFotoCliente] = useState(null)
  const [fotoClientePreview, setFotoClientePreview] = useState(null)
  const [lado, setLado] = useState('frente')
  const webhookUrl = DEFAULT_WEBHOOK
  const [loading, setLoading] = useState(false)

  if (!dados) return null

  const handleFotoProduto = async (file) => {
    setFotoProduto(file)
    setFotoProdutoPreview(URL.createObjectURL(file))
  }

  const handleFotoCliente = async (file) => {
    setFotoCliente(file)
    setFotoClientePreview(URL.createObjectURL(file))
  }

  const handleEnviar = async () => {
    if (!fotoProduto) { showToast('Adicione a foto do produto', 'error'); return }
    if (!fotoCliente) { showToast('Adicione sua foto', 'error'); return }

    if (!canUseProvador) {
      showToast(`Limite de ${getLimitePlano(profile?.plano)} fotos atingido. Atualize seu plano!`, 'error')
      return
    }

    setLoading(true)
    try {
      const [base64Produto, base64Cliente] = await Promise.all([
        fileToBase64(fotoProduto),
        fileToBase64(fotoCliente),
      ])

      const resultado = await enviarParaWebhook({
        webhookUrl,
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        altura: parseInt(dados.altura),
        peso: parseInt(dados.peso),
        fotoProduto: base64Produto,
        fotoCliente: base64Cliente,
        ladoSelecionado: lado,
      })

      // Salvar no Supabase se logado
      if (profile?.id && profile.id !== 'mock-user-id') {
        try {
          const { data: user } = await supabase.auth.getUser()
          if (user?.user) {
            await supabase.from('trocas').insert([{
              user_id: profile.id,
              nome: dados.nome,
              whatsapp: dados.whatsapp,
              altura: parseInt(dados.altura),
              peso: parseInt(dados.peso),
              foto_resultado: resultado.resultado_url,
              tamanho: resultado.tamanho,
            }])

            await supabase.rpc('increment_fotos_usadas', { uid: profile.id })
            setProfile(p => ({ ...p, fotos_usadas: (p.fotos_usadas || 0) + 1 }))

            await supabase.from('clientes').upsert([{
              user_id: profile.id,
              nome: dados.nome,
              whatsapp: dados.whatsapp,
              ultima_troca: new Date().toISOString(),
            }], { onConflict: 'user_id,whatsapp' })
          }
        } catch (dbErr) {
          console.warn('[DB] Erro ao salvar:', dbErr)
        }
      }

      showToast('Foto processada com sucesso!', 'success')
      navigate('/provador/resultado', {
        state: {
          resultado: resultado.resultado_url,
          tamanho: resultado.tamanho,
          dados,
        },
      })
    } catch (err) {
      console.error('[Provador] Erro:', err)
      showToast(err.message || 'Erro ao processar foto', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <Header />

      {/* Page title */}
      <div style={{ padding: '14px 20px 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>
        Provador Virtual ✨
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        <div className="step-dot" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>

      <div className="page-content">
        <div className="section">
          {/* Limite info */}
          {profile && (
            <div style={{
              background: fotosRestantes <= 5 ? 'rgba(229,62,62,0.08)' : 'rgba(72,187,120,0.08)',
              border: `1px solid ${fotosRestantes <= 5 ? 'rgba(229,62,62,0.2)' : 'rgba(72,187,120,0.2)'}`,
              borderRadius: 10, padding: '8px 14px', marginBottom: 16,
              fontSize: 13, color: fotosRestantes <= 5 ? 'var(--danger)' : 'var(--success)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{fotosRestantes <= 5 ? '⚠️' : '✅'}</span>
              <span>{fotosRestantes} fotos restantes no seu plano</span>
            </div>
          )}

          {/* Frente / Costas */}
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Frente ou Costas</div>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${lado === 'frente' ? 'active' : ''}`}
                onClick={() => setLado('frente')}
              >
                🫴 Frente
              </button>
              <button
                className={`toggle-btn ${lado === 'costas' ? 'active' : ''}`}
                onClick={() => setLado('costas')}
              >
                🔙 Costas
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="warning-box" style={{ marginBottom: 16 }}>
            <span>⚠️</span>
            <span>{WARNING_COSTAS}</span>
          </div>

          {/* Uploads - side by side on desktop */}
          <div className="provador-uploads">
            <div className="upload-col">
              <Upload
                label="📦 Foto do Produto"
                sublabel="Enviar foto do produto"
                preview={fotoProdutoPreview}
                onChange={handleFotoProduto}
                onRemove={() => { setFotoProduto(null); setFotoProdutoPreview(null) }}
                height={200}
              />
            </div>

            <div className="upload-col">
              <div className="section-title" style={{ marginBottom: 10 }}>📸 Foto do Cliente</div>

              {/* Photo options */}
              <div className="photo-options" style={{ marginBottom: 12 }}>
                {['Com Roupa', 'Braços Soltos', 'Boa Luz'].map((opt) => (
                  <div key={opt} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 10px', borderRadius: 10, background: 'var(--gray-light)',
                    fontSize: 11, color: 'var(--gray-dark)', fontWeight: 500, flex: 1,
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 18 }}>
                      {opt === 'Com Roupa' ? '👕' : opt === 'Braços Soltos' ? '🙌' : '☀️'}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>

              <Upload
                sublabel={`Enviar sua foto (de ${lado})`}
                preview={fotoClientePreview}
                onChange={handleFotoCliente}
                onRemove={() => { setFotoCliente(null); setFotoClientePreview(null) }}
                height={200}
              />
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="section" style={{ paddingTop: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleEnviar}
            disabled={loading || !fotoProduto || !fotoCliente}
          >
            {loading
              ? <><span className="spinner" /> Processando...</>
              : <>✨ Experimentar Agora</>
            }
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
