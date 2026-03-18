const DEFAULT_WEBHOOK = 'https://seu-n8n.com/webhook/provou-levou'

/**
 * Calcula tamanho ideal baseado em altura e peso
 */
export const calcularTamanho = (altura, peso) => {
  let tamanhoAltura = 'M'
  if (altura < 160) tamanhoAltura = 'PP/P'
  else if (altura <= 170) tamanhoAltura = 'P/M'
  else if (altura <= 180) tamanhoAltura = 'M/G'
  else if (altura <= 190) tamanhoAltura = 'G/GG'
  else tamanhoAltura = 'GG/EG'

  // Ajuste por IMC
  const imc = peso / ((altura / 100) ** 2)
  if (imc > 30 && tamanhoAltura !== 'GG/EG') {
    const sizes = ['PP/P', 'P/M', 'M/G', 'G/GG', 'GG/EG']
    const idx = sizes.indexOf(tamanhoAltura)
    if (idx < sizes.length - 1) tamanhoAltura = sizes[idx + 1]
  }

  return tamanhoAltura
}

/**
 * Converte File para base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Envia dados para webhook n8n
 */
export const enviarParaWebhook = async ({
  webhookUrl,
  nome,
  whatsapp,
  altura,
  peso,
  fotoProduto,
  fotoCliente,
  ladoSelecionado,
}) => {
  const url = webhookUrl || DEFAULT_WEBHOOK

  console.log('[N8N] Enviando para webhook:', url)
  console.log('[N8N] Dados:', { nome, whatsapp, altura, peso, ladoSelecionado })

  const payload = {
    nome,
    whatsapp,
    altura: Number(altura),
    peso: Number(peso),
    lado: ladoSelecionado,
    foto_produto: fotoProduto,
    foto_cliente: fotoCliente,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro desconhecido')
    throw new Error(`Webhook retornou ${response.status}: ${text}`)
  }

  const data = await response.json()
  console.log('[N8N] Resposta:', data)

  return {
    resultado_url: data.resultado_url || data.imageUrl || data.url || null,
    tamanho: data.tamanho || calcularTamanho(altura, peso),
    raw: data,
  }
}

/**
 * Mock do webhook para testes
 */
export const mockWebhook = async ({ nome, altura, peso }) => {
  console.log('[MOCK N8N] Simulando webhook...')
  await new Promise(r => setTimeout(r, 2500))

  const tamanho = calcularTamanho(altura, peso)

  return {
    resultado_url: `https://picsum.photos/400/600?random=${Date.now()}`,
    tamanho,
    raw: { mock: true, nome, tamanho },
  }
}
