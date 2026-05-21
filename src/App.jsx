import { useEffect, useMemo, useRef, useState } from 'react'
import { buildMarkdown } from './utils/buildMarkdown.js'
import { Ico } from './components/Icons.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { Editor } from './components/Editor.jsx'
import { Preview } from './components/Preview.jsx'
import { SettingsModal } from './components/SettingsModal.jsx'
import { GitlabPostModal } from './components/GitlabPostModal.jsx'
import { KpiEditModal } from './components/KpiEditModal.jsx'
import { ManageKpisModal } from './components/ManageKpisModal.jsx'
import { ConfirmModal } from './components/ConfirmModal.jsx'
import { Toast } from './components/Toast.jsx'
import { initDb } from './db/sqlite.js'
import {
  listParentKpis,
  createParentKpi,
  updateParentKpi,
  deleteParentKpi,
  listSubKpis,
  createSubKpi,
  updateSubKpi,
  deleteSubKpi,
  getEntriesForParent,
  upsertEntry,
  clearEntriesForParent,
  getSettings as repoGetSettings,
  setSettings as repoSetSettings,
} from './db/repo.js'

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
  const [ready, setReady] = useState(false)
  const [bootError, setBootError] = useState(null)
  const [parents, setParents] = useState([])
  const [subKpis, setSubKpis] = useState([])
  const [formState, setFormState] = useState({})
  const [settings, setSettingsState] = useState({
    aiKey: '',
    glUrl: 'https://gitlab.com',
    glToken: '',
    activeParentId: '',
  })
  const [activeParentId, setActiveParentId] = useState(null)
  const [activeSubId, setActiveSubId] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewTab, setPreviewTab] = useState('preview')
  const [showSettings, setShowSettings] = useState(false)
  const [showGitlab, setShowGitlab] = useState(false)
  const [showManageParents, setShowManageParents] = useState(false)
  const [parentModal, setParentModal] = useState(null)
  const [subModal, setSubModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 2200)
  }

  const reloadParents = () => {
    const list = listParentKpis()
    setParents(list)
    return list
  }

  const reloadSubsAndEntries = (parentId) => {
    if (parentId == null) {
      setSubKpis([])
      setFormState({})
      setActiveSubId(null)
      return
    }
    const subs = listSubKpis(parentId)
    setSubKpis(subs)
    setFormState(getEntriesForParent(parentId))
    setActiveSubId((cur) => {
      if (subs.length === 0) return null
      if (cur && subs.some((s) => s.id === cur)) return cur
      return subs[0].id
    })
  }

  const persistActiveParent = (parentId) => {
    const next = { ...settings, activeParentId: parentId == null ? '' : String(parentId) }
    setSettingsState(next)
    repoSetSettings({ activeParentId: next.activeParentId })
  }

  const switchParent = (parentId) => {
    setActiveParentId(parentId)
    reloadSubsAndEntries(parentId)
    persistActiveParent(parentId)
  }

  useEffect(() => {
    let alive = true
    initDb()
      .then(() => {
        if (!alive) return
        const s = repoGetSettings()
        setSettingsState(s)
        const list = reloadParents()
        const savedId = s.activeParentId ? parseInt(s.activeParentId, 10) : null
        const initialParent = list.find((p) => p.id === savedId) || list[0] || null
        const initialId = initialParent?.id ?? null
        setActiveParentId(initialId)
        reloadSubsAndEntries(initialId)
        setReady(true)
      })
      .catch((e) => {
        console.error(e)
        if (alive) setBootError(e.message || String(e))
      })
    return () => {
      alive = false
    }
  }, [])

  const activeParent = useMemo(
    () => parents.find((p) => p.id === activeParentId) || null,
    [parents, activeParentId]
  )
  const activeSub = useMemo(() => subKpis.find((k) => k.id === activeSubId) || null, [subKpis, activeSubId])

  const completedCount = subKpis.filter((k) => formState[k.id]?.status).length
  const percent = subKpis.length === 0 ? 0 : (completedCount / subKpis.length) * 100

  const idx = activeSub ? subKpis.findIndex((k) => k.id === activeSub.id) : -1
  const navInfo = {
    prev: idx > 0 ? subKpis[idx - 1] : null,
    next: idx >= 0 && idx < subKpis.length - 1 ? subKpis[idx + 1] : null,
  }

  const setKpiState = (updater) => {
    if (!activeSub) return
    setFormState((prev) => {
      const cur = prev[activeSub.id] || {}
      const next = typeof updater === 'function' ? updater(cur) : updater
      upsertEntry(activeSub.id, next)
      return { ...prev, [activeSub.id]: next }
    })
  }

  /* Parent KPI handlers */
  const handleAddParent = () => setParentModal({ initial: null })
  const handleEditParent = (parent) => setParentModal({ initial: parent })
  const handleDeleteParent = (parent) => {
    setConfirm({
      title: 'Hapus KPI',
      message: `Hapus KPI "${parent.title}" beserta semua sub KPI dan jawabannya?`,
      confirmLabel: 'Hapus',
      onConfirm: () => {
        deleteParentKpi(parent.id)
        const list = reloadParents()
        if (parent.id === activeParentId) {
          const next = list[0]?.id ?? null
          switchParent(next)
        }
        showToast('KPI dihapus')
      },
    })
  }
  const handleSaveParent = ({ id, title, description }) => {
    if (id) {
      updateParentKpi(id, { title, description })
      showToast('KPI tersimpan')
    } else {
      const newId = createParentKpi({ title, description })
      reloadParents()
      switchParent(newId)
      setParentModal(null)
      setShowManageParents(false)
      showToast('KPI ditambahkan')
      return
    }
    reloadParents()
    setParentModal(null)
  }

  /* Sub KPI handlers */
  const handleAddSub = () => setSubModal({ initial: null })
  const handleEditSub = (sub) => setSubModal({ initial: sub })
  const handleDeleteSub = (sub) => {
    setConfirm({
      title: 'Hapus sub KPI',
      message: `Hapus "${sub.title}"? Jawaban dan attachment-nya juga akan hilang.`,
      confirmLabel: 'Hapus',
      onConfirm: () => {
        deleteSubKpi(sub.id)
        reloadSubsAndEntries(activeParentId)
        showToast('Sub KPI dihapus')
      },
    })
  }
  const handleSaveSub = ({ id, title, description }) => {
    if (id) {
      updateSubKpi(id, { title, description })
      showToast('Sub KPI tersimpan')
    } else {
      if (activeParentId == null) return
      const newId = createSubKpi({ parentId: activeParentId, title, description })
      setActiveSubId(newId)
      showToast('Sub KPI ditambahkan')
    }
    reloadSubsAndEntries(activeParentId)
    setSubModal(null)
  }

  const reset = () => {
    if (!activeParent) return
    setConfirm({
      title: 'Reset jawaban',
      message: `Hapus semua status, catatan, evidence, dan attachment di "${activeParent.title}"? Sub KPI itu sendiri tidak dihapus.`,
      confirmLabel: 'Reset',
      onConfirm: () => {
        clearEntriesForParent(activeParentId)
        setFormState({})
        showToast('Jawaban direset')
      },
    })
  }

  const updateSettings = (next) => {
    setSettingsState((cur) => ({ ...cur, ...next }))
    repoSetSettings({ aiKey: next.aiKey, glUrl: next.glUrl, glToken: next.glToken })
  }

  const handleDbReplaced = () => {
    const s = repoGetSettings()
    setSettingsState(s)
    const list = reloadParents()
    const savedId = s.activeParentId ? parseInt(s.activeParentId, 10) : null
    const initial = list.find((p) => p.id === savedId) || list[0] || null
    const initialId = initial?.id ?? null
    setActiveParentId(initialId)
    reloadSubsAndEntries(initialId)
  }

  const onCopy = () => {
    const md = buildMarkdown(activeParent, subKpis, formState)
    navigator.clipboard?.writeText(md).then(
      () => showToast('Markdown disalin ke clipboard'),
      () => showToast('Gagal menyalin')
    )
  }

  const onDownload = () => {
    const md = buildMarkdown(activeParent, subKpis, formState)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const d = new Date()
    const slug = (activeParent?.title || 'laporan-kpi').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    a.href = url
    a.download = `${slug}-${d.toISOString().slice(0, 10)}.md`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
    showToast('.md ter-download')
  }

  useEffect(() => {
    const h = (e) => {
      if (e.target.matches('input, textarea, select')) return
      if (idx < 0) return
      if (e.key === 'ArrowDown' && idx < subKpis.length - 1) {
        setActiveSubId(subKpis[idx + 1].id)
        e.preventDefault()
      }
      if (e.key === 'ArrowUp' && idx > 0) {
        setActiveSubId(subKpis[idx - 1].id)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [idx, subKpis])

  if (bootError) {
    return (
      <div className="boot-screen">
        <div className="boot-card boot-error">
          <Ico.X size={20} />
          <h2>Gagal memuat database</h2>
          <p>{bootError}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="brand-mark" style={{ width: 36, height: 36 }}>
            <Ico.Bar size={18} />
          </div>
          <p>Memuat database…</p>
        </div>
      </div>
    )
  }

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
          <button
            className="btn btn-danger"
            onClick={reset}
            title="Reset jawaban KPI aktif"
            disabled={!activeParent}
          >
            <Ico.Reset size={13} /> Reset
          </button>
        </div>
      </header>

      <Sidebar
        parent={activeParent}
        subKpis={subKpis}
        activeId={activeSubId}
        setActiveId={setActiveSubId}
        formState={formState}
        percent={percent}
        onManageParents={() => setShowManageParents(true)}
        onAddSub={handleAddSub}
        onEditSub={handleEditSub}
        onDeleteSub={handleDeleteSub}
      />

      <Editor
        key={(activeParent?.id || 'none') + ':' + (activeSub?.id || 'empty')}
        parent={activeParent}
        sub={activeSub}
        subKpis={subKpis}
        state={(activeSub && formState[activeSub.id]) || {}}
        setState={setKpiState}
        onNav={(id) => setActiveSubId(id)}
        navInfo={navInfo}
        onToast={showToast}
        onAddFirstParent={() => {
          setShowManageParents(true)
        }}
        onAddFirstSub={handleAddSub}
      />

      {previewOpen && (
        <Preview
          tab={previewTab}
          setTab={setPreviewTab}
          parent={activeParent}
          subKpis={subKpis}
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
          setSettings={updateSettings}
          onToast={showToast}
          onDbReplaced={handleDbReplaced}
        />
      )}
      {showGitlab && <GitlabPostModal onClose={() => setShowGitlab(false)} onToast={showToast} />}

      {showManageParents && (
        <ManageKpisModal
          parents={parents}
          activeId={activeParentId}
          onSelect={switchParent}
          onAdd={handleAddParent}
          onEdit={handleEditParent}
          onDelete={handleDeleteParent}
          onClose={() => setShowManageParents(false)}
        />
      )}

      {parentModal && (
        <KpiEditModal
          initial={parentModal.initial}
          entityLabel="KPI"
          onClose={() => setParentModal(null)}
          onSave={handleSaveParent}
        />
      )}
      {subModal && (
        <KpiEditModal
          initial={subModal.initial}
          entityLabel="Sub KPI"
          onClose={() => setSubModal(null)}
          onSave={handleSaveSub}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      <Toast msg={toast} />
    </div>
  )
}
