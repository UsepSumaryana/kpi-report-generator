import { KPIS, STATUS_OPTIONS } from '../data/kpis.js'
import { Ico } from './Icons.jsx'
import { ProgressRing } from './ProgressRing.jsx'

export function Sidebar({ activeId, setActiveId, formState, percent }) {
  const completedCount = Object.values(formState).filter((s) => s && s.status).length
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ProgressRing value={percent} />
        <div className="sidebar-header-text">
          <span className="label">Progress</span>
          <span className="value">
            {completedCount} / {KPIS.length} KPI
          </span>
        </div>
      </div>

      <div className="kpi-list">
        <div className="kpi-section-label">Form Penilaian</div>
        {KPIS.map((k) => {
          const s = formState[k.id] || {}
          const completed = !!s.status
          const active = k.id === activeId
          const mode = s.mode || 'manual'
          const opt = STATUS_OPTIONS.find((o) => o.value === s.status)
          return (
            <button
              key={k.id}
              className={`kpi-item${active ? ' active' : ''}${completed ? ' completed' : ''}`}
              onClick={() => setActiveId(k.id)}
            >
              <div className="kpi-num">{completed ? <Ico.Check size={12} /> : k.id}</div>
              <div className="kpi-text">
                <div className="kpi-title">{k.title}</div>
                <div className="kpi-meta">
                  <span className={`kpi-status-dot ${s.status || ''}`}></span>
                  {s.status ? <span>{opt?.label.replace(/^[^\s]+\s/, '')}</span> : <span>Belum diisi</span>}
                  <span style={{ flex: 1 }}></span>
                  <span className={`mode-tag${mode === 'ai' ? ' ai' : ''}`}>
                    {mode === 'ai' ? (
                      <>
                        <Ico.Sparkle size={9} /> AI
                      </>
                    ) : (
                      'Manual'
                    )}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <span>Lokal saja</span>
          <span>v2.0</span>
        </div>
        <div className="sidebar-footer-row" style={{ fontSize: 11 }}>
          Data tidak dikirim ke server
        </div>
      </div>
    </aside>
  )
}
