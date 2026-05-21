import { useEffect, useState } from 'react'
import { Ico } from './Icons.jsx'
import { ensurePersistent, exportBytes, flush, replaceWithBytes, resetDb, storageStatus } from '../db/sqlite.js'

export function SettingsModal({ onClose, settings, setSettings, onToast, onDbReplaced }) {
  const [tab, setTab] = useState('ai')
  const [aiKey, setAiKey] = useState(settings.aiKey || '')
  const [glUrl, setGlUrl] = useState(settings.glUrl || 'https://gitlab.com')
  const [glToken, setGlToken] = useState(settings.glToken || '')

  const save = () => {
    setSettings({ ...settings, aiKey, glUrl, glToken })
    onToast('Settings tersimpan')
    onClose()
  }
  const clear = () => {
    if (tab === 'ai') {
      setAiKey('')
      setSettings({ ...settings, aiKey: '' })
      onToast('API key dihapus')
    } else if (tab === 'gitlab') {
      setGlToken('')
      setSettings({ ...settings, glToken: '' })
      onToast('Token dihapus')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Ico.Settings size={18} />
          <span className="modal-title">Settings</span>
          <button className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>

        <div className="modal-segmented modal-segmented-3">
          <button className={tab === 'ai' ? 'active' : ''} onClick={() => setTab('ai')}>
            <Ico.Sparkle size={12} /> AI
          </button>
          <button className={tab === 'gitlab' ? 'active' : ''} onClick={() => setTab('gitlab')}>
            <Ico.GitLab size={12} /> GitLab
          </button>
          <button className={tab === 'db' ? 'active' : ''} onClick={() => setTab('db')}>
            <Ico.Doc size={12} /> Database
          </button>
        </div>

        {tab === 'ai' && (
          <div className="field">
            <label className="field-label">DeepSeek API Key</label>
            <input
              className="input"
              type="password"
              placeholder="sk-…"
              style={{ fontFamily: 'var(--font-mono)' }}
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Dapatkan dari{' '}
              <a
                href="https://platform.deepseek.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                platform.deepseek.com
              </a>
            </div>
          </div>
        )}

        {tab === 'gitlab' && (
          <>
            <div className="field">
              <label className="field-label">GitLab Instance URL</label>
              <input
                className="input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={glUrl}
                onChange={(e) => setGlUrl(e.target.value)}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Default: gitlab.com. Untuk self-hosted, isi URL instance Anda.
              </div>
            </div>
            <div className="field">
              <label className="field-label">Personal Access Token</label>
              <input
                className="input"
                type="password"
                placeholder="glpat-…"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={glToken}
                onChange={(e) => setGlToken(e.target.value)}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Buat token dengan scope{' '}
                <code
                  style={{
                    background: 'var(--surface)',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  api
                </code>{' '}
                di Settings → Access Tokens GitLab Anda.
              </div>
            </div>
          </>
        )}

        {tab === 'db' && <DatabasePanel onToast={onToast} onDbReplaced={onDbReplaced} onClose={onClose} />}

        {tab !== 'db' && (
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={save}>
              Simpan
            </button>
            <button className="btn btn-danger" onClick={clear}>
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DatabasePanel({ onToast, onDbReplaced, onClose }) {
  const [persistent, setPersistent] = useState(!!storageStatus().persistent)
  const [busy, setBusy] = useState(false)
  const fileRef = (typeof window !== 'undefined' ? null : null)

  useEffect(() => {
    let alive = true
    if (navigator.storage?.persisted) {
      navigator.storage.persisted().then((p) => {
        if (alive) setPersistent(!!p)
      })
    }
    return () => {
      alive = false
    }
  }, [])

  const requestPersist = async () => {
    const ok = await ensurePersistent()
    setPersistent(ok)
    onToast(ok ? 'Persistent storage diaktifkan' : 'Browser menolak persistent storage')
  }

  const doExport = async () => {
    setBusy(true)
    try {
      await flush()
      const bytes = exportBytes()
      const blob = new Blob([bytes], { type: 'application/x-sqlite3' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const d = new Date()
      a.download = `kpi-${d.toISOString().slice(0, 10)}.db`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 500)
      onToast('Database ter-export')
    } finally {
      setBusy(false)
    }
  }

  const doImport = async (file) => {
    if (!file) return
    if (!confirm('Mengganti database saat ini dengan file ini? Data sekarang akan hilang.')) return
    setBusy(true)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      await replaceWithBytes(bytes)
      onDbReplaced()
      onToast('Database di-import')
      onClose()
    } catch (e) {
      onToast('Gagal: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const doReset = async () => {
    if (!confirm('Reset database ke seed default? Semua KPI dan jawaban akan hilang.')) return
    setBusy(true)
    try {
      await resetDb()
      onDbReplaced()
      onToast('Database direset')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="field">
        <label className="field-label">Persistent Storage</label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: persistent ? 'var(--success-soft)' : 'var(--warning-soft)',
            border: `1px solid ${persistent ? 'var(--success-soft-border)' : 'var(--warning-soft-border)'}`,
            borderRadius: 9,
            fontSize: 13,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: persistent ? 'var(--success)' : 'var(--warning)',
            }}
          ></span>
          <span style={{ flex: 1 }}>
            {persistent
              ? 'Data aman dari eviction otomatis browser'
              : 'Belum persistent — browser bisa hapus data saat storage penuh'}
          </span>
          {!persistent && (
            <button className="btn" style={{ height: 28 }} onClick={requestPersist}>
              Aktifkan
            </button>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Backup &amp; Restore</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn" disabled={busy} onClick={doExport}>
            <Ico.Download size={13} /> Export .db
          </button>
          <label className="btn" style={{ cursor: 'pointer' }}>
            <Ico.Copy size={13} /> Import .db
            <input
              type="file"
              accept=".db,.sqlite,.sqlite3,application/x-sqlite3"
              style={{ display: 'none' }}
              onChange={(e) => doImport(e.target.files?.[0])}
            />
          </label>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          File .db SQLite standar — bisa dibuka dengan DB Browser, sqlite3 CLI, dll.
        </div>
      </div>

      <div className="field">
        <label className="field-label">Reset</label>
        <button className="btn btn-danger" disabled={busy} onClick={doReset}>
          <Ico.Reset size={13} /> Reset ke Default
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Mengembalikan database ke 5 KPI default. Tidak bisa di-undo.
        </div>
      </div>
    </>
  )
}
