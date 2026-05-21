import { STATUS_OPTIONS } from '../data/kpis.js'

export function buildMarkdown(parent, subKpis, formState, renderAttachment) {
  const today = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
  const heading = parent ? `${parent.title} — ${dateStr}` : `Laporan KPI — ${dateStr}`
  let md = `# 📊 ${heading}\n\n`
  if (parent?.desc) md += `_${parent.desc}_\n\n`
  md += `## Ringkasan Sub KPI\n\n`
  if (subKpis.length === 0) {
    md += `_Belum ada sub KPI._\n\n`
  }
  subKpis.forEach((k, i) => {
    const s = formState[k.id]
    const checked = s && s.status && s.status !== '' ? 'x' : ' '
    md += `- [${checked}] ${i + 1}. ${k.title}\n`
  })
  if (subKpis.length > 0) md += `\n## Detail Sub KPI\n\n`
  subKpis.forEach((k, i) => {
    const s = formState[k.id] || {}
    md += `### ${i + 1}. ${k.title}\n\n`
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
      if (renderAttachment) {
        const rendered = s.attachments.map(renderAttachment).filter(Boolean).join('\n\n')
        if (rendered) md += `**Lampiran:**\n\n${rendered}\n\n`
      } else {
        md += `**Attachment:** ${s.attachments.map((a) => a.name).join(', ')}\n\n`
      }
    }
    if (!s.status && !s.catatan && !s.evidence) {
      md += `_Belum diisi._\n\n`
    }
  })
  return md
}
