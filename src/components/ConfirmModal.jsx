import { Ico } from './Icons.jsx'

export function ConfirmModal({ title, message, confirmLabel = 'Hapus', danger = true, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Ico.Help size={18} />
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>
        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.55 }}>{message}</p>
        <div className="modal-actions">
          <button
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{ height: 38, padding: '0 16px' }}
          >
            {confirmLabel}
          </button>
          <button className="btn" onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
