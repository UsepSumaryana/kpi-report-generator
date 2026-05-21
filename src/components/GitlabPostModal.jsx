import { useState } from 'react'
import { Ico } from './Icons.jsx'

export function GitlabPostModal({ onClose, onToast }) {
  const [url, setUrl] = useState('')
  const canPost = /gitlab.*issues\/\d+/.test(url)

  const post = () => {
    onToast('Komentar terkirim ke GitLab ✓')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ color: 'var(--gitlab)' }}>
            <Ico.GitLab size={20} />
          </span>
          <span className="modal-title">Post ke GitLab</span>
          <button className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>

        <div className="field">
          <label className="field-label">Link Issue GitLab</label>
          <input
            className="input"
            style={{ fontFamily: 'var(--font-mono)' }}
            placeholder="https://gitlab.com/group/project/-/issues/42"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Paste link issue GitLab — project &amp; issue ID akan otomatis dikenali.
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" disabled={!canPost} onClick={post}>
            <Ico.Send size={13} /> Post sebagai Komentar
          </button>
          <button className="btn" onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
