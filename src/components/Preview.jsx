import { STATUS_OPTIONS } from '../data/kpis.js'
import { buildMarkdown } from '../utils/buildMarkdown.js'
import { Ico } from './Icons.jsx'

export function Preview({ tab, setTab, parent, subKpis, formState, onClose, onCopy, onDownload, onPostGitlab }) {
  const md = buildMarkdown(parent, subKpis, formState)

  return (
    <aside className="preview">
      <div className="preview-header">
        <div className="preview-tabs">
          <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>
            <Ico.Doc size={12} /> Preview
          </button>
          <button className={tab === 'raw' ? 'active' : ''} onClick={() => setTab('raw')}>
            <Ico.Code size={12} /> Raw
          </button>
        </div>
        <div className="preview-actions">
          <button className="btn btn-ghost" onClick={onCopy} title="Copy markdown">
            <Ico.Copy size={13} /> Copy
          </button>
          <button className="btn btn-primary" onClick={onDownload} title="Download .md">
            <Ico.Download size={13} /> .md
          </button>
          <button className="btn btn-gitlab" onClick={onPostGitlab} title="Post ke GitLab">
            <Ico.GitLab size={13} /> GitLab
          </button>
          <button className="btn btn-icon btn-ghost" onClick={onClose} title="Tutup preview">
            <Ico.X size={14} />
          </button>
        </div>
      </div>
      <div className="preview-body">
        {tab === 'preview' ? (
          <DocView parent={parent} subKpis={subKpis} formState={formState} />
        ) : (
          <RawView md={md} />
        )}
      </div>
    </aside>
  )
}

function DocView({ parent, subKpis, formState }) {
  const today = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
  const heading = parent ? parent.title : 'Laporan KPI'

  return (
    <div className="doc">
      <h1>
        📊 {heading} <span className="date">— {dateStr}</span>
      </h1>
      {parent?.desc && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{parent.desc}</p>}
      <hr />
      <h2>Ringkasan Sub KPI</h2>
      {!parent && <p className="empty-note">Belum ada KPI yang dipilih.</p>}
      {parent && subKpis.length === 0 && <p className="empty-note">Belum ada sub KPI.</p>}
      <ul>
        {subKpis.map((k, i) => {
          const checked = !!(formState[k.id] && formState[k.id].status)
          return (
            <li key={k.id}>
              <input type="checkbox" checked={checked} readOnly />
              <span>
                {i + 1}. {k.title}
              </span>
            </li>
          )
        })}
      </ul>
      {subKpis.length > 0 && <h2>Detail Sub KPI</h2>}
      {subKpis.map((k, i) => {
        const s = formState[k.id] || {}
        const hasContent = s.status || s.catatan || s.evidence
        const opt = STATUS_OPTIONS.find((o) => o.value === s.status)
        return (
          <div className="kpi-detail" key={k.id}>
            <h3>
              {i + 1}. {k.title}
            </h3>
            {!hasContent && <p className="empty-note">Belum diisi.</p>}
            {s.status && (
              <p>
                <strong>Status:</strong> {opt ? opt.label : s.status}
              </p>
            )}
            {s.catatan && (
              <p>
                <strong>Catatan:</strong> {s.catatan}
              </p>
            )}
            {s.evidence && (
              <p>
                <strong>Evidence/Lampiran:</strong> {s.evidence}
              </p>
            )}
            {s.attachments && s.attachments.length > 0 && (
              <p>
                <strong>Attachment:</strong> {s.attachments.map((a) => a.name).join(', ')}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RawView({ md }) {
  const lines = md.split('\n')
  const colorize = (line) => {
    if (line.startsWith('# ')) {
      return <span className="h">{line}</span>
    }
    if (line.startsWith('## ') || line.startsWith('### ')) {
      return <span className="h">{line}</span>
    }
    if (line.startsWith('- ')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <span className="li">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <span key={i} className="b">
                {p}
              </span>
            ) : (
              <span key={i}>{p}</span>
            )
          )}
        </span>
      )
    }
    if (line.startsWith('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <span key={i} className="b">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )
    }
    if (line.startsWith('_') && line.endsWith('_')) {
      return <span className="c">{line}</span>
    }
    return <span>{line || ' '}</span>
  }

  return (
    <div className="raw">
      <div className="raw-gutter">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="raw-content">
        {lines.map((l, i) => (
          <div key={i}>{colorize(l)}</div>
        ))}
      </div>
    </div>
  )
}
