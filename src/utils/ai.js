const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions'

async function callDeepSeek(messages, apiKey, maxTokens = 1000) {
  const res = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content?.trim() || ''
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`AI tidak mengembalikan JSON yang valid: ${raw.slice(0, 200)}`)
  }
}

const ANALYZE_SYSTEM = `Kamu adalah asisten evaluasi KPI profesional. Atasan pengguna akan membaca laporan ini.

Tugas kamu:
1. Analisis konteks yang diberikan pengguna untuk sub KPI tertentu.
2. Jika konteks CUKUP JELAS dan LENGKAP, berikan evaluasi detail (5-7 paragraf) dalam format laporan formal.
3. Jika konteks KURANG JELAS atau ada informasi yang hilang, ajukan 3-5 pertanyaan klarifikasi spesifik.

ATURAN PENTING:
- Tulis dalam Bahasa Indonesia formal, seolah-olah kamu menulis laporan untuk manager/atasan.
- Gunakan tone profesional, objektif, dan berbasis data.
- Tentukan status KPI: "tercapai", "partial" (tercapai sebagian), "belum" (belum tercapai), atau "na" (tidak berlaku).
- JANGAN mengarang data — hanya gunakan informasi dari konteks pengguna.
- Jika konteks tidak cukup untuk menentukan status, lebih baik tanya daripada menebak.
- Jika ada lampiran link (commit, issue, screenshot, dashboard, PR, MR) sebutkan di field evidence.
- Saat mengajukan pertanyaan klarifikasi, WAJIB tanyakan link/lampiran terkait jika belum disebutkan.

Format JSON wajib:
Jika cukup info: { "action": "summarize", "status": "<tercapai|partial|belum|na>", "summary": "<laporan detail 5-7 paragraf>", "evidence": "<link atau daftar lampiran, kosongkan jika tidak ada>" }
Jika kurang info: { "action": "clarify", "questions": ["<pertanyaan 1>", "<pertanyaan 2>", ...] }`

const FINALIZE_SYSTEM = `Kamu adalah asisten evaluasi KPI profesional. Atasan pengguna akan membaca laporan ini.

Tugas kamu:
Pengguna sudah memberikan konteks awal dan sekarang menjawab pertanyaan klarifikasi kamu. Gabungkan SEMUA informasi untuk membuat laporan evaluasi KPI yang detail dan profesional.

ATURAN PENTING:
- Tulis dalam Bahasa Indonesia formal, seolah-olah kamu menulis laporan untuk manager/atasan.
- Gunakan tone profesional, objektif, dan berbasis data.
- Buat laporan 5-7 paragraf yang mencakup: ringkasan pekerjaan, pencapaian, kendala (jika ada), bukti pendukung, dan rekomendasi.
- Tentukan status KPI: "tercapai", "partial" (tercapai sebagian), "belum" (belum tercapai), atau "na" (tidak berlaku).
- JANGAN mengarang data — hanya gunakan informasi dari konteks dan jawaban pengguna.
- Ekstrak SEMUA lampiran link (commit, issue, screenshot, dashboard, PR, MR) dari jawaban pengguna dan cantumkan di field evidence.

Format JSON wajib:
{ "status": "<tercapai|partial|belum|na>", "summary": "<laporan detail 3 paragraf>", "evidence": "<link atau daftar lampiran, kosongkan jika tidak ada>" }`

export async function analyzeContext(context, subKpiTitle, apiKey) {
  if (!apiKey) throw new Error('API key tidak tersedia')
  if (!context?.trim()) throw new Error('Konteks tidak boleh kosong')

  const result = await callDeepSeek(
    [
      { role: 'system', content: ANALYZE_SYSTEM },
      {
        role: 'user',
        content: `Sub KPI: "${subKpiTitle}"\n\nKonteks dari pengguna:\n${context}`,
      },
    ],
    apiKey,
  )

  if (result.action === 'clarify') {
    return { stage: 'clarify', questions: result.questions || [] }
  }

  return {
    stage: 'done',
    status: result.status || '',
    summary: result.summary || '',
    evidence: result.evidence || '',
  }
}

export async function finalizeContext(context, answers, subKpiTitle, apiKey) {
  if (!apiKey) throw new Error('API key tidak tersedia')

  const qaText = answers.map((a, i) => `Jawaban ${i + 1}: ${a}`).join('\n')

  const result = await callDeepSeek(
    [
      { role: 'system', content: FINALIZE_SYSTEM },
      {
        role: 'user',
        content: `Sub KPI: "${subKpiTitle}"\n\nKonteks awal:\n${context}\n\nJawaban klarifikasi:\n${qaText}`,
      },
    ],
    apiKey,
  )

  return {
    status: result.status || '',
    summary: result.summary || '',
    evidence: result.evidence || '',
  }
}
