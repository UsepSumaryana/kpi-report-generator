import { useState } from 'react'
import { Ico } from './Icons.jsx'

export function KpiEditModal({ initial, onClose, onSave, entityLabel = 'KPI' }) {
  const isEdit = !!initial?.id
  const [title, setTitle] = useState(initial?.title || '')
  const [desc, setDesc] = useState(initial?.desc || '')

  const submit = (e) => {
    e?.preventDefault()
    const t = title.trim()
    if (!t) return
    onSave({ id: initial?.id, title: t, description: desc.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          {isEdit ? <Ico.Pencil size={18} /> : <Ico.Sparkle size={18} />}
          <span className="modal-title">
            {isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel} Baru`}
          </span>
          <button type="button" className="modal-close" onClick={onClose}>
            <Ico.X size={14} />
          </button>
        </div>

        <div className="field">
          <label className="field-label">
            Judul {entityLabel}
            <span className="hint">wajib</span>
          </label>
          <input
            className="input"
            placeholder={
              entityLabel === 'Sub KPI'
                ? 'Contoh: Code Review Selesai dalam 24 Jam'
                : 'Contoh: Laporan KPI Q1 2026'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label">
            Deskripsi
            <span className="hint">opsional</span>
          </label>
          <textarea
            className="textarea"
            placeholder="Penjelasan singkat…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ minHeight: 90 }}
          />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            <Ico.Check size={13} /> {isEdit ? 'Simpan' : 'Tambah'}
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
