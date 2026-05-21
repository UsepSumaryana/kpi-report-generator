import { Ico } from './Icons.jsx'

export function ManageKpisModal({ parents, activeId, onSelect, onAdd, onEdit, onDelete, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Ico.Bar size={18} />
          <span className="modal-title">Kelola KPI</span>
          <button className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-muted)' }}>
          Pilih KPI aktif, atau tambah/edit/hapus dari daftar.
        </p>

        <div className="parent-list">
          {parents.length === 0 && (
            <div className="parent-empty">Belum ada KPI. Tambahkan KPI pertama Anda di bawah.</div>
          )}
          {parents.map((p) => {
            const active = p.id === activeId
            return (
              <div
                key={p.id}
                className={`parent-item${active ? ' active' : ''}`}
                onClick={() => {
                  onSelect(p.id)
                  onClose()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(p.id)
                    onClose()
                  }
                }}
              >
                <div className="parent-radio">
                  {active ? <Ico.Check size={12} /> : <span className="dot" />}
                </div>
                <div className="parent-text">
                  <div className="parent-title">{p.title}</div>
                  {p.desc && <div className="parent-desc">{p.desc}</div>}
                </div>
                <div className="parent-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="kpi-action"
                    title="Edit KPI"
                    onClick={() => onEdit(p)}
                    aria-label={`Edit ${p.title}`}
                  >
                    <Ico.Pencil size={11} />
                  </button>
                  <button
                    className="kpi-action danger"
                    title="Hapus KPI"
                    onClick={() => onDelete(p)}
                    aria-label={`Hapus ${p.title}`}
                  >
                    <Ico.Reset size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button className="kpi-add" style={{ width: '100%', marginTop: 12 }} onClick={onAdd}>
          <span className="plus">+</span>
          <span>Tambah KPI</span>
        </button>
      </div>
    </div>
  )
}
