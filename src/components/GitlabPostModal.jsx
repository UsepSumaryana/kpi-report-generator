import { useMemo, useState } from 'react'
import { Ico } from './Icons.jsx'
import { buildMarkdown } from '../utils/buildMarkdown.js'
import { parseIssueUrl, dataUrlToBlob, uploadFile, postIssueComment, buildNoteUrl } from '../utils/gitlabApi.js'

export function GitlabPostModal({ onClose, onToast, parent, subKpis, formState, settings, onOpenSettings }) {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('idle') // idle | uploading | posting | done | error
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')
  const [noteUrl, setNoteUrl] = useState('')

  const parsed = useMemo(() => parseIssueUrl(url), [url])
  const hasToken = !!settings?.glToken
  const canPost = !!parsed && hasToken && !busy && stage !== 'done'

  const doPost = async () => {
    setBusy(true)
    setError('')
    setStage('idle')
    try {
      if (!parsed) throw new Error('URL issue tidak valid.')
      if (!hasToken) throw new Error('Token GitLab belum diatur di Settings.')

      const { host, projectPath, issueIid, issueUrl } = parsed

      const toUpload = []
      subKpis.forEach((k) => {
        const e = formState[k.id]
        if (!e || !e.attachments) return
        e.attachments.forEach((a) => {
          if (a.dataUrl) toUpload.push(a)
        })
      })

      const uploadMap = {}
      if (toUpload.length > 0) {
        setStage('uploading')
        setProgress({ current: 0, total: toUpload.length })
        for (let i = 0; i < toUpload.length; i++) {
          const a = toUpload[i]
          setProgress({ current: i + 1, total: toUpload.length })
          const blob = dataUrlToBlob(a.dataUrl)
          const result = await uploadFile({
            host,
            token: settings.glToken,
            projectPath,
            blob,
            filename: a.name,
          })
          uploadMap[a.id] = result.markdown
        }
      }

      const renderAttachment = (a) => {
        if (uploadMap[a.id]) return uploadMap[a.id]
        if (a.oversize) return `\`${a.name}\` _(file terlalu besar, tidak diunggah)_`
        return `\`${a.name}\``
      }

      const body = buildMarkdown(parent, subKpis, formState, renderAttachment)

      setStage('posting')
      const note = await postIssueComment({
        host,
        token: settings.glToken,
        projectPath,
        issueIid,
        body,
      })

      const finalUrl = note.id ? buildNoteUrl(issueUrl, note.id) : issueUrl
      setNoteUrl(finalUrl)
      setStage('done')
      onToast('Komentar terkirim ke GitLab ✓')
      window.open(finalUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error(e)
      setError(e.message || String(e))
      setStage('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ color: 'var(--gitlab)' }}>
            <Ico.GitLab size={20} />
          </span>
          <span className="modal-title">Post ke GitLab</span>
          <button className="modal-close" onClick={onClose} disabled={busy}>
            <Ico.X size={14} />
          </button>
        </div>

        {!hasToken && (
          <div className="ai-callout" style={{ marginBottom: 16 }}>
            <div className="ai-callout-header">
              <Ico.Help size={14} /> Token GitLab belum diatur
            </div>
            <div className="ai-callout-body">
              Buat Personal Access Token dengan scope <code style={{ background: 'var(--surface)', padding: '0 4px', borderRadius: 4 }}>api</code> di GitLab, lalu simpan di Settings.
              <div style={{ marginTop: 10 }}>
                <button className="btn" onClick={onOpenSettings}>
                  <Ico.Settings size={13} /> Buka Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label">Link Issue GitLab</label>
          <input
            className="input"
            style={{ fontFamily: 'var(--font-mono)' }}
            placeholder="https://gitlab.com/group/project/-/issues/42"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            disabled={busy || stage === 'done'}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {parsed ? (
              <>
                Project: <code style={{ fontFamily: 'var(--font-mono)' }}>{parsed.projectPath}</code> · Issue #
                {parsed.issueIid}
              </>
            ) : (
              'Paste link issue GitLab — project & issue ID akan otomatis dikenali.'
            )}
          </div>
        </div>

        {stage === 'uploading' && (
          <div className="ai-callout" style={{ marginBottom: 12 }}>
            <div className="ai-callout-header">
              <Ico.Sparkle size={14} /> Mengunggah attachment {progress.current} / {progress.total}…
            </div>
            <div className="ai-thinking">
              <span>File dikirim ke GitLab uploads</span>
              <span className="ai-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}

        {stage === 'posting' && (
          <div className="ai-callout" style={{ marginBottom: 12 }}>
            <div className="ai-callout-header">
              <Ico.Send size={14} /> Mengirim komentar…
            </div>
            <div className="ai-thinking">
              <span>Menulis ke issue #{parsed?.issueIid}</span>
              <span className="ai-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}

        {stage === 'done' && noteUrl && (
          <div className="ai-result" style={{ marginBottom: 12 }}>
            <div className="ai-result-head">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Ico.Check size={14} /> Komentar berhasil dikirim
              </span>
            </div>
            <div className="ai-result-row">
              <div className="k">Link Komentar</div>
              <div className="v" style={{ wordBreak: 'break-all' }}>
                <a href={noteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {noteUrl}
                </a>
              </div>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div
            className="ai-callout"
            style={{
              marginBottom: 12,
              borderColor: 'var(--danger)',
              background: 'var(--danger-soft)',
            }}
          >
            <div className="ai-callout-header" style={{ color: 'var(--danger)' }}>
              <Ico.X size={14} /> Gagal
            </div>
            <div className="ai-callout-body" style={{ whiteSpace: 'pre-wrap' }}>
              {error}
            </div>
          </div>
        )}

        <div className="modal-actions">
          {stage === 'done' ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => window.open(noteUrl, '_blank', 'noopener,noreferrer')}
              >
                <Ico.Arrow size={13} /> Buka di GitLab
              </button>
              <button className="btn" onClick={onClose}>
                Tutup
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" disabled={!canPost} onClick={doPost}>
                <Ico.Send size={13} /> {busy ? 'Mengirim…' : 'Post sebagai Komentar'}
              </button>
              <button className="btn" onClick={onClose} disabled={busy}>
                Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
