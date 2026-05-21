import { useEffect, useState } from 'react'
import { KPIS } from './data/kpis.js'
import { buildMarkdown } from './utils/buildMarkdown.js'
import { Ico } from './components/Icons.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { Editor } from './components/Editor.jsx'
import { Preview } from './components/Preview.jsx'
import { SettingsModal } from './components/SettingsModal.jsx'
import { GitlabPostModal } from './components/GitlabPostModal.jsx'
import { Toast } from './components/Toast.jsx'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('kpi-theme')
      if (saved) return saved
    } catch (e) {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('kpi-theme', theme)
    } catch (e) {
      // ignore
    }
  }, [theme])
  return [theme, setTheme]
}

export default function App() {
  const [theme, setTheme] = useTheme()
  const [activeId, setActiveId] = useState(1)
  const [formState, setFormState] = useState({})
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewTab, setPreviewTab] = useState('preview')
  const [showSettings, setShowSettings] = useState(false)
  const [showGitlab, setShowGitlab] = useState(false)
  const [settings, setSettings] = useState({ aiKey: '', glUrl: 'https://gitlab.com', glToken: '' })
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const completedCount = KPIS.filter((k) => formState[k.id]?.status).length
  const percent = (completedCount / KPIS.length) * 100

  const activeKpi = KPIS.find((k) => k.id === activeId) || KPIS[0]

  const setKpiState = (updater) => {
    setFormState((prev) => {
      const cur = prev[activeKpi.id] || {}
      const next = typeof updater === 'function' ? updater(cur) : updater
      return { ...prev, [activeKpi.id]: next }
    })
  }

  const idx = KPIS.findIndex((k) => k.id === activeId)
  const navInfo = {
    prev: idx > 0 ? KPIS[idx - 1] : null,
    next: idx < KPIS.length - 1 ? KPIS[idx + 1] : null,
  }

  const reset = () => {
    if (confirm('Hapus semua jawaban? Aksi ini tidak bisa dibatalkan.')) {
      setFormState({})
      setActiveId(1)
      showToast('Form direset')
    }
  }

  const onCopy = () => {
    const md = buildMarkdown(formState)
    navigator.clipboard?.writeText(md).then(
      () => showToast('Markdown disalin ke clipboard'),
      () => showToast('Gagal menyalin')
    )
  }

  const onDownload = () => {
    const md = buildMarkdown(formState)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const d = new Date()
    a.href = url
    a.download = `laporan-kpi-${d.toISOString().slice(0, 10)}.md`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
    showToast('.md ter-download')
  }

  useEffect(() => {
    const h = (e) => {
      if (e.target.matches('input, textarea, select')) return
      if (e.key === 'ArrowDown' && idx < KPIS.length - 1) {
        setActiveId(KPIS[idx + 1].id)
        e.preventDefault()
      }
      if (e.key === 'ArrowUp' && idx > 0) {
        setActiveId(KPIS[idx - 1].id)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [idx])

  return (
    <div className={`app${previewOpen ? ' preview-open' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Ico.Bar size={15} />
          </div>
          <span className="brand-name">KPI Report Generator</span>
          <span className="brand-sub">Live preview — isi form, hasil otomatis tampil</span>
        </div>
        <div className="topbar-spacer"></div>

        <div className="topbar-actions">
          <div className="status-pill">
            <span className="dot"></span>
            {settings.aiKey ? 'AI Connected' : 'AI Ready'}
          </div>
          {!previewOpen && (
            <button className="btn" onClick={() => setPreviewOpen(true)} title="Buka preview">
              <Ico.Panel size={13} /> Preview
            </button>
          )}
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle tema"
          >
            {theme === 'dark' ? <Ico.Sun size={14} /> : <Ico.Moon size={14} />}
          </button>
          <button className="btn" onClick={() => setShowSettings(true)} title="Settings">
            <Ico.Settings size={13} /> Settings
          </button>
          <button className="btn btn-danger" onClick={reset} title="Reset semua">
            <Ico.Reset size={13} /> Reset
          </button>
        </div>
      </header>

      <Sidebar activeId={activeId} setActiveId={setActiveId} formState={formState} percent={percent} />

      <Editor
        key={activeKpi.id}
        kpi={activeKpi}
        state={formState[activeKpi.id] || {}}
        setState={setKpiState}
        onNav={(id) => setActiveId(id)}
        navInfo={navInfo}
        onToast={showToast}
      />

      {previewOpen && (
        <Preview
          tab={previewTab}
          setTab={setPreviewTab}
          formState={formState}
          onClose={() => setPreviewOpen(false)}
          onCopy={onCopy}
          onDownload={onDownload}
          onPostGitlab={() => setShowGitlab(true)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          settings={settings}
          setSettings={setSettings}
          onToast={showToast}
        />
      )}
      {showGitlab && <GitlabPostModal onClose={() => setShowGitlab(false)} onToast={showToast} />}

      <Toast msg={toast} />
    </div>
  )
}
