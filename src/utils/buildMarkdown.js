import { KPIS, STATUS_OPTIONS } from '../data/kpis.js'

export function buildMarkdown(formState) {
  const today = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
  let md = `# 📊 Laporan KPI — ${dateStr}\n\n`
  md += `## Ringkasan KPI\n\n`
  KPIS.forEach((k) => {
    const s = formState[k.id]
    const checked = s && s.status && s.status !== '' ? 'x' : ' '
    md += `- [${checked}] ${k.id}. ${k.title}\n`
  })
  md += `\n## Detail KPI\n\n`
  KPIS.forEach((k) => {
    const s = formState[k.id] || {}
    md += `### ${k.id}. ${k.title}\n\n`
    if (s.status) {
      const opt = STATUS_OPTIONS.find((o) => o.value === s.status)
      md += `**Status:** ${opt ? opt.label : s.status}\n\n`
    }
    if (s.catatan) {
      md += `**Catatan:** ${s.catatan}\n\n`
    }
    if (s.evidence) {
      md += `**Evidence/Lampiran:** ${s.evidence}\n\n`
    }
    if (s.attachments && s.attachments.length) {
      md += `**Attachment:** ${s.attachments.map((a) => a.name).join(', ')}\n\n`
    }
    if (!s.status && !s.catatan && !s.evidence) {
      md += `_Belum diisi._\n\n`
    }
  })
  return md
}
