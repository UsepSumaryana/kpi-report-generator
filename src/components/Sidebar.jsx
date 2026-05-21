import { STATUS_OPTIONS } from '../data/kpis.js'
import { Ico } from './Icons.jsx'
import { ProgressRing } from './ProgressRing.jsx'

export function Sidebar({
  parent,
  subKpis,
  activeId,
  setActiveId,
  formState,
  percent,
  onManageParents,
  onAddSub,
  onEditSub,
  onDeleteSub,
}) {
  const completedCount = subKpis.filter((k) => formState[k.id]?.status).length

  return (
    <aside className="sidebar">
      <button className="sidebar-header parent-selector" onClick={onManageParents}>
        <ProgressRing value={percent} />
        <div className="sidebar-header-text">
          <span className="label">KPI Aktif</span>
          <span className="value" title={parent?.title || ''}>
            {parent?.title || 'Belum ada KPI'}
          </span>
          <span className="meta">
            {parent
              ? `${completedCount} / ${subKpis.length} sub KPI selesai`
              : 'Klik untuk tambah KPI'}
          </span>
        </div>
        <Ico.ChevronDown size={14} />
      </button>

      <div className="kpi-list">
        <div className="kpi-section-label">Sub KPI</div>
        {parent && subKpis.length === 0 && (
          <div className="kpi-empty">Belum ada sub KPI di bawah KPI ini.</div>
        )}
        {subKpis.map((k, i) => {
          const s = formState[k.id] || {}
          const completed = !!s.status
          const active = k.id === activeId
          const mode = s.mode || 'manual'
          const opt = STATUS_OPTIONS.find((o) => o.value === s.status)
          return (
            <div
              key={k.id}
              className={`kpi-item${active ? ' active' : ''}${completed ? ' completed' : ''}`}
              onClick={() => setActiveId(k.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveId(k.id)
                }
              }}
            >
              <div className="kpi-num">{completed ? <Ico.Check size={12} /> : i + 1}</div>
              <div className="kpi-text">
                <div className="kpi-title">{k.title}</div>
                <div className="kpi-meta">
                  <span className={`kpi-status-dot ${s.status || ''}`}></span>
                  {s.status ? (
                    <span>{opt?.label.replace(/^[^\s]+\s/, '')}</span>
                  ) : (
                    <span>Belum diisi</span>
                  )}
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
              <div className="kpi-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="kpi-action"
                  title="Edit sub KPI"
                  onClick={() => onEditSub(k)}
                  aria-label={`Edit ${k.title}`}
                >
                  <Ico.Pencil size={11} />
                </button>
                <button
                  className="kpi-action danger"
                  title="Hapus sub KPI"
                  onClick={() => onDeleteSub(k)}
                  aria-label={`Hapus ${k.title}`}
                >
                  <Ico.Reset size={11} />
                </button>
              </div>
            </div>
          )
        })}

        {parent && (
          <button className="kpi-add" onClick={onAddSub}>
            <span className="plus">+</span>
            <span>Tambah Sub KPI</span>
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <span>Lokal saja</span>
          <span>v2.2</span>
        </div>
        <div className="sidebar-footer-row" style={{ fontSize: 11 }}>
          Data tersimpan di browser (SQLite)
        </div>
      </div>
    </aside>
  )
}
