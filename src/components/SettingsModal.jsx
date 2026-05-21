import { useState } from 'react'
import { Ico } from './Icons.jsx'

export function SettingsModal({ onClose, settings, setSettings, onToast }) {
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
    } else {
      setGlToken('')
      setSettings({ ...settings, glToken: '' })
    }
    onToast('Dihapus')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Ico.Settings size={18} />
          <span className="modal-title">Settings</span>
          <button className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>

        <div className="modal-segmented">
          <button className={tab === 'ai' ? 'active' : ''} onClick={() => setTab('ai')}>
            <Ico.Sparkle size={12} /> AI (DeepSeek)
          </button>
          <button className={tab === 'gitlab' ? 'active' : ''} onClick={() => setTab('gitlab')}>
            <Ico.GitLab size={12} /> GitLab
          </button>
        </div>

        {tab === 'ai' ? (
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
              <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                platform.deepseek.com
              </a>
            </div>
          </div>
        ) : (
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

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>
            Simpan
          </button>
          <button className="btn btn-danger" onClick={clear}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
