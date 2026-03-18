export const DEFAULT_WEBHOOK = 'https://n8n.segredosdodrop.com/webhook/materialize-generico'

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

  // Tenta ler como JSON primeiro, senão como base64/binary
  const contentType = response.headers.get('content-type') || ''
  let data
  let resultadoUrl = null

  if (contentType.includes('image/')) {
    // Resposta é uma imagem binária diretamente
    const blob = await response.blob()
    resultadoUrl = URL.createObjectURL(blob)
    data = {}
  } else if (contentType.includes('application/json')) {
    data = await response.json()
    console.log('[N8N] Resposta JSON:', data)

    // Suporta vários formatos de resposta do n8n
    if (data.resultado_url) {
      resultadoUrl = data.resultado_url
    } else if (data.imageUrl) {
      resultadoUrl = data.imageUrl
    } else if (data.url) {
      resultadoUrl = data.url
    } else if (data.image) {
      // Base64 image retornada pelo n8n
      const prefix = data.image.startsWith('data:') ? '' : 'data:image/png;base64,'
      resultadoUrl = prefix + data.image
    } else if (data.data) {
      // Formato alternativo com campo "data" contendo base64
      const imgData = typeof data.data === 'string' ? data.data : JSON.stringify(data.data)
      if (imgData.startsWith('data:') || imgData.startsWith('/9j/') || imgData.startsWith('iVBOR')) {
        const prefix = imgData.startsWith('data:') ? '' : 'data:image/png;base64,'
        resultadoUrl = prefix + imgData
      }
    }
  } else {
    // Tenta ler como texto (pode ser base64 puro)
    const text = await response.text()
    if (text.startsWith('data:image')) {
      resultadoUrl = text
    } else if (text.startsWith('/9j/') || text.startsWith('iVBOR')) {
      resultadoUrl = 'data:image/png;base64,' + text
    } else {
      // Tenta parsear como JSON mesmo sem content-type correto
      try {
        data = JSON.parse(text)
        resultadoUrl = data.resultado_url || data.imageUrl || data.url || data.image || null
        if (resultadoUrl && !resultadoUrl.startsWith('http') && !resultadoUrl.startsWith('data:')) {
          resultadoUrl = 'data:image/png;base64,' + resultadoUrl
        }
      } catch {
        console.warn('[N8N] Resposta não reconhecida:', text.substring(0, 100))
      }
    }
    data = data || {}
  }

  console.log('[N8N] Resultado URL presente:', !!resultadoUrl)

  return {
    resultado_url: resultadoUrl,
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
